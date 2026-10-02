import { NextRequest, NextResponse } from "next/server";
import { PayPalPaymentProvider } from "@/lib/payments/paypalProvider";
import { getDb } from "@/lib/db";
import { validateIdentityAndQuote, getOutbidSlotId } from "@/lib/ranking";
import { APP_CONFIG, dollarsToMinor } from "@/lib/config";
import { generateSlug } from "@/lib/identity/normalizer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identity, displayName, description, categorySlug, desiredTotalDollars } = body;

    if (!identity || !displayName || !categorySlug) {
      return NextResponse.json(
        { error: "Artist link, display name, and category are required." },
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

    const quote = validateIdentityAndQuote(identity, totalDollars);
    const nowIso = new Date().toISOString();
    let listingId = quote.listingId;

    if (!listingId) {
      listingId = `list_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const slug = generateSlug(displayName);
      let finalSlug = slug;
      let counter = 1;
      while (db.prepare("SELECT 1 FROM listings WHERE slug = ?").get(finalSlug)) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      db.prepare(`
        INSERT INTO listings (
          id, canonical_identity, identity_type, display_name, slug, description,
          destination_url, status, category_id, listed_at, total_paid_minor,
          click_count, created_at, updated_at
        ) VALUES (?, ?, 'website', ?, ?, ?, ?, 'pending', ?, ?, 0, 0, ?, ?)
      `).run(
        listingId,
        quote.canonicalIdentity,
        displayName.trim(),
        finalSlug,
        (description || "").trim().slice(0, 280),
        quote.canonicalIdentity,
        category.id,
        nowIso,
        nowIso,
        nowIso
      );
    }

    const slotId = getOutbidSlotId(categorySlug, totalDollars);
    const origin = request.nextUrl.origin;
    const paypal = new PayPalPaymentProvider();

    const checkoutResult = await paypal.createCheckout({
      listingId,
      artistName: displayName,
      amountMinor: quote.incrementMinor,
      currency: APP_CONFIG.currency,
      isRaise: quote.existing,
      successUrl: `${origin}/checkout/paypal-return?order_id={CHECKOUT_ORDER_ID}&listing_id=${listingId}&slot_id=${slotId}`,
      cancelUrl: `${origin}/checkout/cancel?listing_id=${listingId}`,
      metadata: {
        listingId,
        slotId,
        categorySlug,
        categoryName: category.name,
      },
    });

    return NextResponse.json({
      orderId: checkoutResult.sessionId,
      approveUrl: checkoutResult.checkoutUrl,
      slotId,
      amountMinor: quote.incrementMinor,
      listingId,
    });
  } catch (error: unknown) {
    console.error("PayPal Create Order Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create PayPal order.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
