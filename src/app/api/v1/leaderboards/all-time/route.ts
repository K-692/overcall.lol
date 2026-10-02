import { NextRequest, NextResponse } from "next/server";
import { getAllTimeLeaderboard } from "@/lib/ranking";
import { APP_CONFIG } from "@/lib/config";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || String(APP_CONFIG.pageSize), 10);
    const search = searchParams.get("q") || undefined;

    const result = getAllTimeLeaderboard({
      timeframe: "all-time",
      categorySlug,
      page,
      limit,
      search,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("All-time leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
