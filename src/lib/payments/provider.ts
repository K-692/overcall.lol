/**
 * overcall.lol — Payment Provider Interface
 * Reference: Section 8.5 of overcall_lol.md
 */

export interface CheckoutSessionParams {
  listingId: string;
  artistName: string;
  amountMinor: number;
  currency: string;
  isRaise: boolean;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
  provider: string;
}

export interface PaymentWebhookResult {
  verified: boolean;
  eventType: string;
  providerTransactionId: string;
  providerEventId: string;
  amountMinor: number;
  listingId: string;
  isRaise: boolean;
  status: "paid" | "failed" | "pending";
  metadata?: Record<string, unknown>;
}

export interface PaymentProvider {
  name: string;
  createCheckout(params: CheckoutSessionParams): Promise<CheckoutSessionResult>;
  verifyWebhook(payload: string | Buffer, signature: string): Promise<PaymentWebhookResult>;
  getTransaction(transactionId: string): Promise<{ status: string; amountMinor: number }>;
}
