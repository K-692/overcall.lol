import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { applyConfirmedPayment, calculateAllTimeRank } from "@/lib/ranking";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-webhook-signature") || "simulated";

    const provider = getPaymentProvider();
    const webhookData = await provider.verifyWebhook(rawBody, signature);

    if (!webhookData.verified) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    if (webhookData.status !== "paid") {
      return NextResponse.json({ received: true, status: webhookData.status });
    }

    // Atomically apply confirmed payment with timestamp verification
    const metadata = webhookData.metadata || {};
    const paymentTimestamp = 
      (typeof metadata.paymentTimestamp === "string" ? metadata.paymentTimestamp : undefined) ||
      (typeof metadata.simulatedAt === "string" ? metadata.simulatedAt : undefined);
    const slotId = typeof metadata.slotId === "string" ? metadata.slotId : undefined;
    const categorySlug = typeof metadata.categorySlug === "string" ? metadata.categorySlug : undefined;

    const result = applyConfirmedPayment({
      listingId: webhookData.listingId,
      providerTransactionId: webhookData.providerTransactionId,
      providerEventId: webhookData.providerEventId,
      amountMinor: webhookData.amountMinor,
      transactionType: webhookData.isRaise ? "raise" : "initial",
      paymentTimestamp,
      slotId,
      categorySlug,
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

    const newRank = calculateAllTimeRank(undefined, webhookData.listingId);

    return NextResponse.json({
      received: true,
      applied: result,
      newRank,
    });
  } catch (error: unknown) {
    console.error("Webhook processing error:", error);
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

