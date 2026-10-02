import { NextRequest, NextResponse } from "next/server";
import { createReport } from "@/lib/moderation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, reason, description, reporterEmail } = body;

    if (!listingId || !reason || !description) {
      return NextResponse.json(
        { error: "Listing ID, reason, and description are required." },
        { status: 400 }
      );
    }

    const reportId = createReport({
      listingId,
      reason,
      description,
      reporterEmail,
    });

    return NextResponse.json({ success: true, reportId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit report.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
