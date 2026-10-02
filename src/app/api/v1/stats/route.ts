import { NextResponse } from "next/server";
import { getPlatformStats } from "@/lib/ranking";

export async function GET() {
  try {
    const stats = getPlatformStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch platform stats" }, { status: 500 });
  }
}
