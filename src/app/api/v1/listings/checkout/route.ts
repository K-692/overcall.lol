import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { validateIdentityAndQuote, getOutbidSlotId } from "@/lib/ranking";
import { getPaymentProvider } from "@/lib/payments";
import { APP_CONFIG, dollarsToMinor } from "@/lib/config";
import { generateSlug, normalizeIdentity, getFaviconUrl } from "@/lib/identity/normalizer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identity, displayName, description, categorySlug, desiredTotalDollars, imageUrl } = body;

    if (!identity || !displayName || !categorySlug) {
      return NextResponse.json(
        { error: "Artist link, display name, and music category are required." },
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

    const db = getDb();
    const category = db
      .prepare("SELECT * FROM categories WHERE slug = ? AND is_active = 1")
      .get(categorySlug) as { id: string; name: string } | undefined;

    if (!category) {
      return NextResponse.json({ error: "Invalid music category selected." }, { status: 400 });
    }

    // 1. Authoritative Server Quote Calculation (Section 8.2)
    const quote = validateIdentityAndQuote(identity, totalDollars);

    if (quote.existing) {
      if (quote.requestedTotalMinor <= quote.currentTotalMinor) {
        return NextResponse.json(
          {
            error: `Artist is currently listed with $${quote.currentTotalMinor / 100}. The new total must exceed this amount.`,
          },
          { status: 422 }
        );
      }
      if (quote.incrementMinor < APP_CONFIG.minRaiseMinor) {
        return NextResponse.json(
          { error: `The minimum raise amount is $${APP_CONFIG.minRaiseMinor / 100}.` },
          { status: 422 }
        );
      }
    } else {
      if (quote.requestedTotalMinor < APP_CONFIG.minInitialBidMinor) {
        return NextResponse.json(
          { error: `Minimum initial bid is $${APP_CONFIG.minInitialBidMinor / 100}.` },
          { status: 422 }
        );
      }
    }

    const nowIso = new Date().toISOString();
    let listingId = quote.listingId;
    const resolvedImageUrl = (imageUrl && imageUrl.trim()) || getFaviconUrl(quote.canonicalIdentity || identity);

    if (!listingId) {
      // Create pending listing entry
      listingId = `list_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const slug = generateSlug(displayName);

      // Ensure slug uniqueness
      let finalSlug = slug;
      let counter = 1;
      while (db.prepare("SELECT 1 FROM listings WHERE slug = ?").get(finalSlug)) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      db.prepare(`
        INSERT INTO listings (
          id, canonical_identity, identity_type, display_name, slug, description,
          destination_url, image_url, status, category_id, listed_at, total_paid_minor,
          click_count, created_at, updated_at
        ) VALUES (?, ?, 'website', ?, ?, ?, ?, ?, 'pending', ?, ?, 0, 0, ?, ?)
      `).run(
        listingId,
        quote.canonicalIdentity,
        displayName.trim(),
        finalSlug,
        (description || "").trim().slice(0, 280),
        quote.canonicalIdentity,
        resolvedImageUrl || null,
        category.id,
        nowIso,
        nowIso,
        nowIso
      );
    } else {
      // Existing listing: update metadata if provided
      db.prepare(`
        UPDATE listings
        SET 
          display_name = COALESCE(?, display_name),
          description = COALESCE(?, description),
          image_url = COALESCE(?, image_url),
          category_id = COALESCE(?, category_id),
          updated_at = ?
        WHERE id = ?
      `).run(
        displayName.trim(),
        (description || "").trim().slice(0, 280),
        resolvedImageUrl || null,
        category.id,
        nowIso,
        listingId
      );
    }

    // 2. Initialize Checkout with Payment Provider
    const slotId = getOutbidSlotId(categorySlug, totalDollars);
    const provider = getPaymentProvider();
    const origin = request.nextUrl.origin;
    const checkoutResult = await provider.createCheckout({
      listingId,
      artistName: displayName,
      amountMinor: quote.incrementMinor,
      currency: APP_CONFIG.currency,
      isRaise: quote.existing,
      successUrl: `${origin}/checkout/success?listing_id=${listingId}`,
      cancelUrl: `${origin}/checkout/cancel?listing_id=${listingId}`,
      metadata: {
        listingId,
        isRaise: String(quote.existing),
        slotId,
        categorySlug,
        categoryName: category.name,
        targetDollars: String(totalDollars),
      },
    });

    return NextResponse.json({
      checkoutId: checkoutResult.sessionId,
      checkoutUrl: checkoutResult.checkoutUrl,
      amountMinor: quote.incrementMinor,
      currency: APP_CONFIG.currency,
      isRaise: quote.existing,
      listingId,
      provider: checkoutResult.provider,
      slotId,
    });

  } catch (error: unknown) {
    console.error("Checkout initiation error:", error);
    const message = error instanceof Error ? error.message : "Failed to initiate checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
