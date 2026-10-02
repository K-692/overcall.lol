import { NextRequest, NextResponse } from "next/server";
import { getOutbidSlot } from "@/lib/ranking";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params;
    if (!slotId) {
      return NextResponse.json({ error: "Slot ID required." }, { status: 400 });
    }

    const slot = getOutbidSlot(slotId);
    if (!slot) {
      return NextResponse.json({
        slotId,
        status: "available",
        claimed: false,
      });
    }

    return NextResponse.json({
      slotId: slot.slot_id,
      categorySlug: slot.category_slug,
      categoryName: slot.category_name,
      amountDollars: slot.amount_dollars,
      status: slot.status,
      claimed: slot.status === "claimed",
      claimedByListingId: slot.claimed_by_listing_id,
      paymentTimestamp: slot.payment_timestamp,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to query slot.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
