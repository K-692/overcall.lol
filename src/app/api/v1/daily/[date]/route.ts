import { NextRequest, NextResponse } from "next/server";
import { getDailyArchive } from "@/lib/ranking";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    // Validate YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date format. Expected YYYY-MM-DD." }, { status: 400 });
    }

    const archive = getDailyArchive(date);
    return NextResponse.json(archive);
  } catch (error) {
    console.error("Daily archive error:", error);
    return NextResponse.json({ error: "Failed to fetch daily archive" }, { status: 500 });
  }
}
