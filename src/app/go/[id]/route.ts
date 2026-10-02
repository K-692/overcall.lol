import { NextRequest, NextResponse } from "next/server";
import { recordOutboundClick } from "@/lib/tracking";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userAgent = request.headers.get("user-agent");
    const referrer = request.headers.get("referer");

    const result = recordOutboundClick(id, userAgent, referrer);

    if (!result || !result.destinationUrl) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.redirect(result.destinationUrl, { status: 302 });
  } catch (error) {
    console.error("Outbound click error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
