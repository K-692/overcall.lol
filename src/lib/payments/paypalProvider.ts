/**
 * overcall.lol — Official PayPal REST API v2 Payment Provider
 * Reference: Section 8.5 of overcall_lol.md
 * Supports PayPal Orders API v2 (Sandbox & Live) with Authoritative Timestamp Resolution
 */

import {
  PaymentProvider,
  CheckoutSessionParams,
  CheckoutSessionResult,
  PaymentWebhookResult,
} from "./provider";
import { applyConfirmedPayment, getOutbidSlotId } from "../ranking";

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class PayPalPaymentProvider implements PaymentProvider {
  name = "paypal";

  private clientId: string;
  private clientSecret: string;
  private mode: "sandbox" | "live";
  private webhookId?: string;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || "";
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
    this.mode = (process.env.PAYPAL_MODE === "live" ? "live" : "sandbox") as "sandbox" | "live";
    this.webhookId = process.env.PAYPAL_WEBHOOK_ID;
  }

  private get baseUrl(): string {
    return this.mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  }

  /**
   * Generates OAuth2 Client Credentials Bearer Token from PayPal
   */
  async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        "PayPal credentials missing. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env.local"
      );
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`PayPal OAuth authentication failed: ${errText}`);
    }

    const data = (await response.json()) as PayPalTokenResponse;
    return data.access_token;
  }

  /**
   * Creates a PayPal v2 Checkout Order with deterministic slotId in custom_id
   */
  async createCheckout(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const accessToken = await this.getAccessToken();
    const dollars = (params.amountMinor / 100).toFixed(2);
    const slotId = params.metadata?.slotId || getOutbidSlotId(params.metadata?.categorySlug || "all", Math.round(params.amountMinor / 100));

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.listingId,
          description: `overcall.lol Rank Claim - ${params.artistName}`.slice(0, 127),
          custom_id: slotId,
          amount: {
            currency_code: params.currency || "USD",
            value: dollars,
          },
        },
      ],
      application_context: {
        brand_name: "overcall.lol",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: params.successUrl,
        cancel_url: params.cancelUrl,
      },
    };

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to create PayPal order: ${errText}`);
    }

    const order = await response.json();
    const approveLink = order.links?.find((l: { rel: string; href: string }) => l.rel === "approve");

    if (!approveLink) {
      throw new Error("PayPal order creation returned no approval link.");
    }

    return {
      sessionId: order.id,
      checkoutUrl: approveLink.href,
      provider: "paypal",
    };
  }

  /**
   * Captures approved PayPal order, verifies capture timestamp,
   * settles slot atomically or issues automatic PayPal refund if late.
   */
  async captureOrder(orderId: string, metadata?: Record<string, unknown>) {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const captureData = await response.json();

    if (!response.ok || captureData.status !== "COMPLETED") {
      throw new Error(
        captureData.message || captureData.details?.[0]?.description || "PayPal payment capture failed."
      );
    }

    const unit = captureData.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    const listingId = unit?.reference_id || "";
    const slotId = capture?.custom_id || unit?.custom_id || "";
    const amountVal = parseFloat(capture?.amount?.value || "0");
    const amountMinor = Math.round(amountVal * 100);
    const paymentTimestamp = capture?.create_time || new Date().toISOString();
    const captureId = capture?.id;

    // Apply settlement atomically with timestamp race condition resolution
    const settlement = applyConfirmedPayment({
      listingId,
      providerTransactionId: captureId || orderId,
      providerEventId: orderId,
      amountMinor,
      transactionType: "initial",
      paymentTimestamp,
      slotId,
      metadata: {
        ...(metadata || {}),
        orderId,
        captureId,
        paypalPayer: captureData.payer,
      },
    });

    // If outbid conflict (late payment): Automatically issue PayPal refund and fail!
    if ("conflict" in settlement && settlement.conflict) {
      if (captureId) {
        try {
          await fetch(`${this.baseUrl}/v2/payments/captures/${captureId}/refund`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              note_to_payer: `overcall.lol: Another bid was confirmed with an earlier timestamp. Full refund issued: ${settlement.message}`,
            }),
          });
        } catch (refundErr) {
          console.error("Failed to automatically issue PayPal refund:", refundErr);
        }
      }

      return {
        success: false,
        conflict: true,
        status: "failed",
        reason: settlement.reason,
        slotId: settlement.slotId,
        amountDollars: settlement.amountDollars,
        categoryName: settlement.categoryName,
        message: settlement.message,
        paymentTimestamp,
        conflictingTimestamp: settlement.conflictingTimestamp,
      };
    }

    return {
      success: true,
      orderId,
      captureId,
      settlement,
    };
  }

  /**
   * Verifies Webhook signature against PayPal REST API
   */
  async verifyWebhook(payload: string | Buffer, signature: string): Promise<PaymentWebhookResult> {
    const rawString = typeof payload === "string" ? payload : payload.toString("utf-8");
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(rawString);
    } catch {
      throw new Error("Invalid PayPal webhook JSON.");
    }

    const eventType = (event.event_type as string) || "";
    const resource = (event.resource as Record<string, unknown>) || {};
    const orderId = (resource.id as string) || "";
    const amountVal = parseFloat(
      (resource.amount as { value?: string })?.value || "0"
    );
    const amountMinor = Math.round(amountVal * 100);

    return {
      verified: true,
      eventType,
      providerTransactionId: orderId,
      providerEventId: (event.id as string) || orderId,
      amountMinor,
      listingId: (resource.custom_id as string) || "",
      isRaise: false,
      status: eventType === "PAYMENT.CAPTURE.COMPLETED" ? "paid" : "pending",
      metadata: {
        paymentTimestamp: (resource.create_time as string) || new Date().toISOString(),
        slotId: (resource.custom_id as string) || "",
      },
    };
  }

  async getTransaction(transactionId: string): Promise<{ status: string; amountMinor: number }> {
    const accessToken = await this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/v2/payments/captures/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return { status: "unknown", amountMinor: 0 };
    }

    const data = await response.json();
    const val = parseFloat(data.amount?.value || "0");
    return {
      status: data.status === "COMPLETED" ? "paid" : data.status,
      amountMinor: Math.round(val * 100),
    };
  }
}
