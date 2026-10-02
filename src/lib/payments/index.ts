/**
 * overcall.lol — Payment Provider Factory
 * Reference: Section 8.5 of overcall_lol.md
 */

import { PaymentProvider } from "./provider";
import { MockPaymentProvider } from "./mockProvider";
import { PayPalPaymentProvider } from "./paypalProvider";

let activeProvider: PaymentProvider | null = null;

export function getPaymentProvider(providerName?: string): PaymentProvider {
  if (providerName === "paypal" || (!providerName && process.env.PAYMENT_PROVIDER === "paypal" && process.env.PAYPAL_CLIENT_ID)) {
    return new PayPalPaymentProvider();
  }

  if (activeProvider) {
    return activeProvider;
  }

  activeProvider = new MockPaymentProvider();
  return activeProvider;
}

export * from "./provider";
export * from "./mockProvider";
export * from "./paypalProvider";

