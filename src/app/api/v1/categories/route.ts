import { NextResponse } from "next/server";
import { getCategoriesWithStats } from "@/lib/categories";

export async function GET() {
  try {
    const categories = getCategoriesWithStats();
    return NextResponse.json({ items: categories });
  } catch (error) {
    console.error("Categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
