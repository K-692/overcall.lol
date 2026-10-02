import { NextRequest, NextResponse } from "next/server";
import { updateListingStatus } from "@/lib/moderation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { newStatus, reason } = body;

    if (!newStatus || !reason) {
      return NextResponse.json({ error: "New status and reason are required." }, { status: 400 });
    }

    updateListingStatus({
      listingId: id,
      newStatus,
      adminUserId: "admin_master",
      reason,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update listing status.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
