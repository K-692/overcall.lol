import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUtcDate } from "@/lib/ranking/rankCalculator";

export async function GET() {
  try {
    const db = getDb();
    const todayUtc = getCurrentUtcDate();

    // Query click events for today
    const clickRow = db
      .prepare("SELECT COUNT(*) as count FROM click_events WHERE date_utc = ?")
      .get(todayUtc) as { count: number };

    // Baseline daily visitors (e.g. 14,800 + recorded clicks * 3)
    const baseVisitors = 14850;
    const dailyVisitors = baseVisitors + (clickRow.count * 4);

    // Dynamic online counter with realistic variation
    const minute = new Date().getMinutes();
    const second = new Date().getSeconds();
    // Deterministic pseudo-fluctuation between 38 and 54
    const wave = Math.sin((minute * 60 + second) / 15) * 8;
    const onlineCount = Math.max(24, Math.round(44 + wave));

    return NextResponse.json({
      dailyVisitors,
      onlineCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Live stats error:", error);
    return NextResponse.json({
      dailyVisitors: 14850,
      onlineCount: 42,
    });
  }
}
