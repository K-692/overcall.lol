import { NextRequest, NextResponse } from "next/server";
import { PayPalPaymentProvider } from "@/lib/payments/paypalProvider";
import { applyConfirmedPayment } from "@/lib/ranking";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("paypal-transmission-sig") || "";

    const paypal = new PayPalPaymentProvider();
    const webhookData = await paypal.verifyWebhook(rawBody, signature);

    if (webhookData.status !== "paid") {
      return NextResponse.json({ received: true, status: webhookData.status });
    }

    const metadata = webhookData.metadata || {};
    const paymentTimestamp = typeof metadata.paymentTimestamp === "string" ? metadata.paymentTimestamp : undefined;
    const slotId = typeof metadata.slotId === "string" ? metadata.slotId : undefined;

    const result = applyConfirmedPayment({
      listingId: webhookData.listingId,
      providerTransactionId: webhookData.providerTransactionId,
      providerEventId: webhookData.providerEventId,
      amountMinor: webhookData.amountMinor,
      transactionType: "initial",
      paymentTimestamp,
      slotId,
      metadata: webhookData.metadata,
    });

    if ("conflict" in result && result.conflict) {
      return NextResponse.json(
        {
          received: true,
          conflict: true,
          status: "failed",
          reason: result.reason,
          slotId: result.slotId,
          amountDollars: result.amountDollars,
          categoryName: result.categoryName,
          message: result.message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ received: true, applied: result });
  } catch (error: unknown) {
    console.error("PayPal Webhook processing error:", error);
    const msg = error instanceof Error ? error.message : "Webhook processing error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
