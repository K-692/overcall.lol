import { NextRequest, NextResponse } from "next/server";
import { validateIdentityAndQuote } from "@/lib/ranking";
import { APP_CONFIG, dollarsToMinor } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identity, desiredTotalDollars } = body;

    if (!identity || typeof identity !== "string") {
      return NextResponse.json(
        { error: "Artist link/identity is required." },
        { status: 400 }
      );
    }

    const totalDollars = parseFloat(desiredTotalDollars);
    if (isNaN(totalDollars) || totalDollars <= 0) {
      return NextResponse.json(
        { error: "A valid positive bid amount is required." },
        { status: 400 }
      );
    }

    const desiredMinor = dollarsToMinor(totalDollars);
    if (desiredMinor > APP_CONFIG.maxBidMinor) {
      return NextResponse.json(
        { error: `Bid amount cannot exceed ${APP_CONFIG.maxBidMinor / 100}.` },
        { status: 400 }
      );
    }

    const quote = validateIdentityAndQuote(identity, totalDollars);

    // Validation checks for initial vs raise
    if (quote.existing) {
      if (quote.requestedTotalMinor <= quote.currentTotalMinor) {
        return NextResponse.json(
          {
            error: `This artist is already listed with $${quote.currentTotalMinor / 100}. Your new total must exceed this amount.`,
            quote,
          },
          { status: 422 }
        );
      }
      if (quote.incrementMinor < APP_CONFIG.minRaiseMinor) {
        return NextResponse.json(
          {
            error: `The minimum raise amount is $${APP_CONFIG.minRaiseMinor / 100}.`,
            quote,
          },
          { status: 422 }
        );
      }
    } else {
      if (quote.requestedTotalMinor < APP_CONFIG.minInitialBidMinor) {
        return NextResponse.json(
          {
            error: `Minimum initial bid is $${APP_CONFIG.minInitialBidMinor / 100}.`,
            quote,
          },
          { status: 422 }
        );
      }
    }

    return NextResponse.json(quote);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Validation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
