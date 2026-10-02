/**
 * overcall.lol — Mock / Sandbox Payment Provider
 * Reference: Section 8.5 of overcall_lol.md
 * Allows seamless offline local testing and live demonstrations with authentic checkout loops.
 */

import { PaymentProvider, CheckoutSessionParams, CheckoutSessionResult, PaymentWebhookResult } from "./provider";

export class MockPaymentProvider implements PaymentProvider {
  name = "mock";

  async createCheckout(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const sessionId = `mock_sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    const slotId = params.metadata?.slotId || "";
    const categorySlug = params.metadata?.categorySlug || "";
    const categoryName = params.metadata?.categoryName || "";
    const targetDollars = params.metadata?.targetDollars || "";

    const checkoutUrl = `/checkout/simulator?session_id=${sessionId}&listing_id=${params.listingId}&amount=${params.amountMinor}&is_raise=${params.isRaise}&artist=${encodeURIComponent(params.artistName)}&slot_id=${encodeURIComponent(slotId)}&category_slug=${encodeURIComponent(categorySlug)}&category_name=${encodeURIComponent(categoryName)}&target_dollars=${encodeURIComponent(targetDollars)}`;

    return {
      sessionId,
      checkoutUrl,
      provider: "mock",
    };

  }

  async verifyWebhook(payload: string, signature: string): Promise<PaymentWebhookResult> {
    try {
      const data = typeof payload === "string" ? JSON.parse(payload) : payload;
      
      return {
        verified: signature === "mock_secret" || signature === "simulated",
        eventType: data.eventType || "checkout.completed",
        providerTransactionId: data.transactionId || `mock_tx_${Date.now()}`,
        providerEventId: data.eventId || `mock_evt_${Date.now()}`,
        amountMinor: data.amountMinor || 0,
        listingId: data.listingId,
        isRaise: Boolean(data.isRaise),
        status: data.status || "paid",
        metadata: data.metadata || {},
      };
    } catch {
      throw new Error("Invalid mock webhook payload.");
    }
  }

  async getTransaction(transactionId: string) {
    return {
      status: "paid",
      amountMinor: 500,
    };
  }
}
