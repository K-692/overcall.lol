import { NextRequest, NextResponse } from "next/server";
import { PayPalPaymentProvider } from "@/lib/payments/paypalProvider";
import { calculateAllTimeRank } from "@/lib/ranking";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, listingId, slotId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "PayPal orderId is required." }, { status: 400 });
    }

    const paypal = new PayPalPaymentProvider();
    const result = await paypal.captureOrder(orderId, { listingId, slotId });

    if ("conflict" in result && result.conflict) {
      // Conflict: another bid claimed the slot with an earlier timestamp!
      // Payment has been failed and refunded.
      return NextResponse.json(
        {
          success: false,
          conflict: true,
          status: "failed",
          reason: result.reason,
          slotId: result.slotId,
          amountDollars: result.amountDollars,
          categoryName: result.categoryName,
          message: result.message,
          paymentTimestamp: result.paymentTimestamp,
          conflictingTimestamp: result.conflictingTimestamp,
        },
        { status: 409 }
      );
    }

    const newRank = listingId ? calculateAllTimeRank(undefined, listingId) : null;

    return NextResponse.json({
      success: true,
      orderId,
      captureId: result.captureId,
      newRank,
    });
  } catch (error: unknown) {
    console.error("PayPal Capture Order Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to capture PayPal order.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
