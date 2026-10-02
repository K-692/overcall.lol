import { NextRequest, NextResponse } from "next/server";
import { getListingBySlug } from "@/lib/ranking";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const listing = getListingBySlug(slug);

    if (!listing) {
      return NextResponse.json({ error: "Artist listing not found." }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Listing detail error:", error);
    return NextResponse.json({ error: "Failed to fetch artist profile" }, { status: 500 });
  }
}
