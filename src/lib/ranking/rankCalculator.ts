/**
 * overcall.lol — Core Ranking Engine & Invariant Calculations
 * Reference: Section 4, Section 5, Section 17, Section 19 of overcall_lol.md
 */

import { getDb } from "../db";
import { APP_CONFIG, dollarsToMinor } from "../config";
import { normalizeIdentity, generateSlug } from "../identity/normalizer";
import type {
  Listing,
  ValidateIdentityResponse,
  LeaderboardQueryParams,
  PlatformStats,
  DailyListingTotal,
  OutbidSlot,
} from "@/types";

/**
 * Generates a deterministic unique ID for an outbid slot.
 * Every outbid slot in a particular category has a unique ID: slot_{categorySlug}_{amountDollars}
 */
export function getOutbidSlotId(categorySlug: string, amountDollars: number): string {
  const cleanCategory = (categorySlug || "all").toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
  const cleanDollars = Math.round(Number(amountDollars));
  return `slot_${cleanCategory}_${cleanDollars}`;
}

/**
 * Retrieves details for a specific unique outbid slot from the database.
 */
export function getOutbidSlot(slotId: string): OutbidSlot | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM outbid_slots WHERE slot_id = ?").get(slotId) as OutbidSlot | undefined;
  return row || null;
}

/**
 * Returns the current date in UTC as YYYY-MM-DD
 */
export function getCurrentUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Calculates current rank for a specific listing on the all-time board.
 * Rule: ORDER BY total_paid_minor DESC, confirmed_sequence ASC
 */
export function calculateAllTimeRank(db = getDb(), listingId: string): number {
  const query = `
    WITH ranked AS (
      SELECT 
        l.id,
        ROW_NUMBER() OVER (
          ORDER BY l.total_paid_minor DESC,
                   COALESCE((SELECT MIN(re.confirmed_sequence) FROM ranking_events re WHERE re.listing_id = l.id), 999999999) ASC
        ) as rank
      FROM listings l
      WHERE l.status = 'active'
    )
    SELECT rank FROM ranked WHERE id = ?
  `;

  const row = db.prepare(query).get(listingId) as { rank?: number } | undefined;
  return row?.rank ?? 0;
}

/**
 * Validates artist link and returns detailed pre-checkout quote.
 * Calculates existing spend, required increment, and estimated post-payment rank.
 */
export function validateIdentityAndQuote(
  rawUrl: string,
  desiredTotalDollars: number
): ValidateIdentityResponse {
  const db = getDb();
  const canonicalIdentity = normalizeIdentity(rawUrl);
  const desiredTotalMinor = dollarsToMinor(desiredTotalDollars);

  // 1. Check if canonical listing already exists
  const existingListing = db
    .prepare(`
      SELECT l.*, c.slug as category_slug
      FROM listings l
      JOIN categories c ON c.id = l.category_id
      WHERE l.canonical_identity = ? AND l.status != 'removed'
    `)
    .get(canonicalIdentity) as (Listing & { category_slug: string }) | undefined;

  // 2. Fetch current #1 all-time listing amount
  const numberOneRow = db
    .prepare(`
      SELECT total_paid_minor 
      FROM listings 
      WHERE status = 'active' 
      ORDER BY total_paid_minor DESC 
      LIMIT 1
    `)
    .get() as { total_paid_minor: number } | undefined;

  const currentNumberOneMinor = numberOneRow?.total_paid_minor ?? 0;
  // Amount needed to take #1 is at least minRaiseMinor ($1) above current #1
  const amountNeededForNumberOneMinor = Math.max(
    currentNumberOneMinor + APP_CONFIG.minRaiseMinor,
    APP_CONFIG.minInitialBidMinor
  );

  if (existingListing) {
    const currentTotalMinor = existingListing.total_paid_minor;
    const incrementMinor = Math.max(0, desiredTotalMinor - currentTotalMinor);
    const currentRank = calculateAllTimeRank(db, existingListing.id);

    // Calculate estimated rank if they pay desiredTotalMinor
    const countAbove = db
      .prepare(`
        SELECT COUNT(*) as count 
        FROM listings 
        WHERE status = 'active' AND id != ? AND total_paid_minor >= ?
      `)
      .get(existingListing.id, desiredTotalMinor) as { count: number };

    const estimatedRank = countAbove.count + 1;

    return {
      canonicalIdentity,
      existing: true,
      listingId: existingListing.id,
      displayName: existingListing.display_name,
      categorySlug: existingListing.category_slug,
      description: existingListing.description,
      currentTotalMinor,
      requestedTotalMinor: desiredTotalMinor,
      incrementMinor,
      currentRank,
      estimatedRank,
      currentNumberOneMinor,
      amountNeededForNumberOneMinor,
    };
  }

  // New listing
  const incrementMinor = desiredTotalMinor;
  const countAbove = db
    .prepare(`
      SELECT COUNT(*) as count 
      FROM listings 
      WHERE status = 'active' AND total_paid_minor >= ?
    `)
    .get(desiredTotalMinor) as { count: number };

  const estimatedRank = countAbove.count + 1;

  return {
    canonicalIdentity,
    existing: false,
    currentTotalMinor: 0,
    requestedTotalMinor: desiredTotalMinor,
    incrementMinor,
    currentRank: null,
    estimatedRank,
    currentNumberOneMinor,
    amountNeededForNumberOneMinor,
  };
}

/**
 * Fetches the All-Time Leaderboard with deterministic ordering.
 * Invariant: total_paid_minor DESC, confirmed_sequence ASC
 */
export function getAllTimeLeaderboard(params: LeaderboardQueryParams) {
  const db = getDb();
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || APP_CONFIG.pageSize));
  const offset = (page - 1) * limit;

  let whereClause = "WHERE l.status = 'active'";
  const queryArgs: unknown[] = [];

  if (params.categorySlug && params.categorySlug !== "all") {
    whereClause += " AND c.slug = ?";
    queryArgs.push(params.categorySlug);
  }

  if (params.search && params.search.trim()) {
    whereClause += " AND (l.display_name LIKE ? OR l.description LIKE ?)";
    queryArgs.push(`%${params.search.trim()}%`, `%${params.search.trim()}%`);
  }

  // Count total matching items
  const countQuery = `
    SELECT COUNT(*) as total
    FROM listings l
    JOIN categories c ON c.id = l.category_id
    ${whereClause}
  `;
  const totalCount = (db.prepare(countQuery).get(...queryArgs) as { total: number }).total;

  // Query paginated rows with ranks
  const rowsQuery = `
    WITH ordered_board AS (
      SELECT 
        l.id,
        l.canonical_identity,
        l.identity_type,
        l.display_name,
        l.slug,
        l.description,
        l.destination_url,
        l.image_url,
        l.status,
        l.category_id,
        l.listed_at,
        l.first_payment_at,
        l.last_payment_at,
        l.total_paid_minor,
        l.click_count,
        l.created_at,
        l.updated_at,
        c.name as category_name,
        c.slug as category_slug,
        ROW_NUMBER() OVER (
          ORDER BY l.total_paid_minor DESC,
                   COALESCE((SELECT MIN(re.confirmed_sequence) FROM ranking_events re WHERE re.listing_id = l.id), 999999999) ASC
        ) as rank
      FROM listings l
      JOIN categories c ON c.id = l.category_id
      ${whereClause}
    )
    SELECT * FROM ordered_board
    LIMIT ? OFFSET ?
  `;

  const rows = db.prepare(rowsQuery).all(...queryArgs, limit, offset) as Listing[];

  return {
    items: rows,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
    },
  };
}

/**
 * Fetches the Today Leaderboard strictly calculated within the current UTC date.
 * Section 4.7 & 4.8
 */
export function getTodayLeaderboard(params: LeaderboardQueryParams) {
  const db = getDb();
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || APP_CONFIG.pageSize));
  const offset = (page - 1) * limit;
  const todayUtc = getCurrentUtcDate();

  let whereClause = "WHERE l.status = 'active' AND d.utc_date = ? AND d.spend_minor > 0";
  const queryArgs: unknown[] = [todayUtc];

  if (params.categorySlug && params.categorySlug !== "all") {
    whereClause += " AND c.slug = ?";
    queryArgs.push(params.categorySlug);
  }

  if (params.search && params.search.trim()) {
    whereClause += " AND (l.display_name LIKE ? OR l.description LIKE ?)";
    queryArgs.push(`%${params.search.trim()}%`, `%${params.search.trim()}%`);
  }

  const countQuery = `
    SELECT COUNT(*) as total
    FROM daily_listing_totals d
    JOIN listings l ON l.id = d.listing_id
    JOIN categories c ON c.id = l.category_id
    ${whereClause}
  `;
  const totalCount = (db.prepare(countQuery).get(...queryArgs) as { total: number }).total;

  const rowsQuery = `
    WITH ordered_today AS (
      SELECT 
        l.id,
        l.canonical_identity,
        l.identity_type,
        l.display_name,
        l.slug,
        l.description,
        l.destination_url,
        l.image_url,
        l.status,
        l.category_id,
        l.listed_at,
        l.total_paid_minor,
        l.click_count,
        d.spend_minor as today_spend_minor,
        c.name as category_name,
        c.slug as category_slug,
        ROW_NUMBER() OVER (
          ORDER BY d.spend_minor DESC, d.ranking_sequence ASC
        ) as rank
      FROM daily_listing_totals d
      JOIN listings l ON l.id = d.listing_id
      JOIN categories c ON c.id = l.category_id
      ${whereClause}
    )
    SELECT * FROM ordered_today
    LIMIT ? OFFSET ?
  `;

  const rows = db.prepare(rowsQuery).all(...queryArgs, limit, offset) as Listing[];

  return {
    utcDate: todayUtc,
    items: rows,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
    },
  };
}

/**
 * Fetches historical Daily Leaderboard archive for a past UTC date.
 * Section 5.4
 */
export function getDailyArchive(dateStr: string) {
  const db = getDb();

  const rowsQuery = `
    SELECT 
      d.rank,
      d.spend_minor,
      d.utc_date,
      l.id as id,
      l.id as listing_id,
      l.display_name,
      l.slug,
      l.image_url,
      l.destination_url,
      l.total_paid_minor,
      c.name as category_name,
      c.slug as category_slug
    FROM daily_listing_totals d
    JOIN listings l ON l.id = d.listing_id
    JOIN categories c ON c.id = l.category_id
    WHERE d.utc_date = ? AND d.spend_minor > 0
    ORDER BY d.spend_minor DESC, d.ranking_sequence ASC
  `;

  const items = db.prepare(rowsQuery).all(dateStr) as DailyListingTotal[];

  // Aggregated metadata for this date
  const statsQuery = `
    SELECT 
      COUNT(*) as participating_listings,
      COALESCE(SUM(spend_minor), 0) as total_daily_spend_minor
    FROM daily_listing_totals
    WHERE utc_date = ? AND spend_minor > 0
  `;
  const stats = db.prepare(statsQuery).get(dateStr) as {
    participating_listings: number;
    total_daily_spend_minor: number;
  };

  return {
    date: dateStr,
    stats,
    items,
  };
}

/**
 * Fetches listing profile details along with current all-time rank,
 * category rank, today rank, and public bid history.
 * Section 10
 */
export function getListingBySlug(slug: string) {
  const db = getDb();
  const listing = db
    .prepare(`
      SELECT l.*, c.name as category_name, c.slug as category_slug
      FROM listings l
      JOIN categories c ON c.id = l.category_id
      WHERE l.slug = ? AND l.status != 'removed'
    `)
    .get(slug) as (Listing & { category_name: string; category_slug: string }) | undefined;

  if (!listing) return null;

  const todayUtc = getCurrentUtcDate();

  // All-time Rank
  const allTimeRank = calculateAllTimeRank(db, listing.id);

  // Category Rank
  const categoryRankRow = db
    .prepare(`
      WITH cat_ranked AS (
        SELECT 
          l.id,
          ROW_NUMBER() OVER (
            ORDER BY l.total_paid_minor DESC,
                     COALESCE((SELECT MIN(re.confirmed_sequence) FROM ranking_events re WHERE re.listing_id = l.id), 999999999) ASC
          ) as rank
        FROM listings l
        WHERE l.status = 'active' AND l.category_id = ?
      )
      SELECT rank FROM cat_ranked WHERE id = ?
    `)
    .get(listing.category_id, listing.id) as { rank?: number } | undefined;

  // Today Rank & Spend
  const todayRow = db
    .prepare(`
      WITH today_ranked AS (
        SELECT 
          listing_id,
          spend_minor,
          ROW_NUMBER() OVER (ORDER BY spend_minor DESC, ranking_sequence ASC) as rank
        FROM daily_listing_totals
        WHERE utc_date = ? AND spend_minor > 0
      )
      SELECT rank, spend_minor FROM today_ranked WHERE listing_id = ?
    `)
    .get(todayUtc, listing.id) as { rank?: number; spend_minor?: number } | undefined;

  // Public Bid History Timeline (Section 10.1: non-sensitive data only)
  const history = db
    .prepare(`
      SELECT 
        amount_minor,
        transaction_type,
        confirmed_at,
        created_at
      FROM bid_transactions
      WHERE listing_id = ? AND status = 'paid'
      ORDER BY created_at DESC
    `)
    .all(listing.id);

  return {
    ...listing,
    rank: allTimeRank,
    category_rank: categoryRankRow?.rank ?? null,
    today_rank: todayRow?.rank ?? null,
    today_spend_minor: todayRow?.spend_minor ?? 0,
    history,
  };
}

/**
 * Returns overall platform statistics.
 * Section 6.6
 */
export function getPlatformStats(): PlatformStats {
  const db = getDb();
  const todayUtc = getCurrentUtcDate();

  const artistsStats = db
    .prepare(`
      SELECT 
        COUNT(*) as total_artists,
        COALESCE(SUM(total_paid_minor), 0) as total_volume_minor,
        COALESCE(SUM(click_count), 0) as total_clicks,
        COALESCE(MAX(total_paid_minor), 0) as highest_bid_minor
      FROM listings
      WHERE status = 'active'
    `)
    .get() as {
      total_artists: number;
      total_volume_minor: number;
      total_clicks: number;
      highest_bid_minor: number;
    };

  const todayStats = db
    .prepare(`
      SELECT 
        COUNT(DISTINCT listing_id) as artists_added_today,
        COALESCE(SUM(spend_minor), 0) as today_volume_minor
      FROM daily_listing_totals
      WHERE utc_date = ? AND spend_minor > 0
    `)
    .get(todayUtc) as {
      artists_added_today: number;
      today_volume_minor: number;
    };

  return {
    totalArtists: artistsStats.total_artists,
    totalVolumeMinor: artistsStats.total_volume_minor,
    totalClicks: artistsStats.total_clicks,
    highestBidMinor: artistsStats.highest_bid_minor,
    artistsAddedToday: todayStats.artists_added_today,
    todayVolumeMinor: todayStats.today_volume_minor,
  };
}

export interface ApplyConfirmedPaymentParams {
  listingId: string;
  providerTransactionId: string;
  providerEventId?: string;
  amountMinor: number;
  transactionType: "initial" | "raise";
  paymentTimestamp?: string;
  slotId?: string;
  categorySlug?: string;
  metadata?: Record<string, unknown>;
}

export type ApplyConfirmedPaymentResult =
  | {
      success: true;
      listingId: string;
      previousTotalMinor: number;
      newTotalMinor: number;
      confirmedSequence: number;
      slotId: string;
    }
  | {
      success: false;
      duplicate: true;
    }
  | {
      success: false;
      conflict: true;
      status: "failed";
      reason: "somebody_else_outbid";
      slotId: string;
      amountDollars: number;
      categoryName: string;
      message: string;
      conflictingTimestamp?: string;
      paymentTimestamp?: string;
    };

/**
 * Applies a confirmed payment atomically, updating totals and sequence deterministically.
 * Rule: Accept first payment according to timestamp; fail late payments with outbid conflict popup message.
 * Reference: Section 19.1 Transaction boundary
 */
export function applyConfirmedPayment(params: ApplyConfirmedPaymentParams): ApplyConfirmedPaymentResult {
  const db = getDb();
  const nowIso = new Date().toISOString();
  const todayUtc = getCurrentUtcDate();
  const verifiedPaymentTimestamp = params.paymentTimestamp || nowIso;

  const executeAtomicPayment = db.transaction((): ApplyConfirmedPaymentResult => {
    // 1. Idempotency check (Section 8.4)
    const existingTx = db
      .prepare("SELECT * FROM bid_transactions WHERE provider_transaction_id = ?")
      .get(params.providerTransactionId) as { status: string; metadata?: string } | undefined;

    if (existingTx) {
      if (existingTx.status === "failed") {
        const meta = existingTx.metadata ? JSON.parse(existingTx.metadata) : {};
        return {
          success: false,
          conflict: true,
          status: "failed",
          reason: "somebody_else_outbid",
          slotId: meta.slotId,
          amountDollars: meta.amountDollars,
          categoryName: meta.categoryName,
          message: meta.message || `Somebody else has bid with $${meta.amountDollars} in ${meta.categoryName}`,
        };
      }
      return { success: false, duplicate: true };
    }

    // 2. Fetch current listing and category details
    const listing = db
      .prepare(`
        SELECT l.*, c.name as category_name, c.slug as category_slug
        FROM listings l
        JOIN categories c ON c.id = l.category_id
        WHERE l.id = ?
      `)
      .get(params.listingId) as (Listing & { category_name: string; category_slug: string }) | undefined;

    if (!listing) {
      throw new Error(`Listing with ID ${params.listingId} not found.`);
    }

    const previousTotalMinor = listing.total_paid_minor;
    const newTotalMinor = previousTotalMinor + params.amountMinor;
    const targetDollars = Math.round(newTotalMinor / 100);

    const categorySlug = params.categorySlug || listing.category_slug;
    const slotId = params.slotId || getOutbidSlotId(categorySlug, targetDollars);

    // 3. Concurrency & Timestamp Conflict Resolution:
    // Accept the first payment according to timestamp; fail late payment and do NOT accept.
    const existingSlot = db
      .prepare("SELECT * FROM outbid_slots WHERE slot_id = ?")
      .get(slotId) as OutbidSlot | undefined;

    let categoryName = existingSlot?.category_name || (params.metadata?.categoryName as string) || "";
    if (!categoryName) {
      const catRow = db.prepare("SELECT name FROM categories WHERE slug = ?").get(categorySlug) as { name: string } | undefined;
      categoryName = catRow?.name || (categorySlug === "all" ? "All Genres" : listing.category_name);
    }


    if (existingSlot && existingSlot.status === "claimed") {
      const existingTs = existingSlot.payment_timestamp || existingSlot.updated_at;
      const isDifferentListing = existingSlot.claimed_by_listing_id !== params.listingId;

      const incomingTime = new Date(verifiedPaymentTimestamp).getTime();
      const existingTime = new Date(existingTs).getTime();

      // If slot was already claimed at an earlier or equal timestamp by someone else:
      if (isDifferentListing && incomingTime >= existingTime) {
        const failureReason = "somebody_else_outbid";
        const conflictMessage = `Somebody else has bid with $${targetDollars.toLocaleString()} in ${categoryName}`;

        const txId = `tx_conflict_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        db.prepare(`
          INSERT INTO bid_transactions (
            id, listing_id, provider_transaction_id, provider_event_id, amount_minor,
            currency, transaction_type, status, confirmed_at, created_at, metadata
          ) VALUES (?, ?, ?, ?, ?, 'USD', ?, 'failed', NULL, ?, ?)
        `).run(
          txId,
          params.listingId,
          params.providerTransactionId,
          params.providerEventId || null,
          params.amountMinor,
          params.transactionType,
          nowIso,
          JSON.stringify({
            reason: failureReason,
            slotId,
            amountDollars: targetDollars,
            categoryName,
            message: conflictMessage,
            incomingTimestamp: verifiedPaymentTimestamp,
            conflictingTimestamp: existingTs,
            conflictingListingId: existingSlot.claimed_by_listing_id,
            ...(params.metadata || {}),
          })
        );

        return {
          success: false,
          conflict: true,
          status: "failed",
          reason: "somebody_else_outbid",
          slotId,
          amountDollars: targetDollars,
          categoryName,
          message: conflictMessage,
          paymentTimestamp: verifiedPaymentTimestamp,
          conflictingTimestamp: existingTs,
        };
      }
    }

    // 4. Accepted payment! First payment according to timestamp.
    const txId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    db.prepare(`
      INSERT INTO bid_transactions (
        id, listing_id, provider_transaction_id, provider_event_id, amount_minor,
        currency, transaction_type, status, confirmed_at, created_at, metadata
      ) VALUES (?, ?, ?, ?, ?, 'USD', ?, 'paid', ?, ?, ?)
    `).run(
      txId,
      params.listingId,
      params.providerTransactionId,
      params.providerEventId || null,
      params.amountMinor,
      params.transactionType,
      verifiedPaymentTimestamp,
      nowIso,
      params.metadata ? JSON.stringify({ ...params.metadata, slotId }) : JSON.stringify({ slotId })
    );

    // 5. Update listing total and timestamps
    db.prepare(`
      UPDATE listings 
      SET 
        total_paid_minor = ?,
        first_payment_at = COALESCE(first_payment_at, ?),
        last_payment_at = ?,
        status = 'active',
        updated_at = ?
      WHERE id = ?
    `).run(newTotalMinor, verifiedPaymentTimestamp, verifiedPaymentTimestamp, nowIso, params.listingId);

    // 6. Monotonic sequence assignment (Section 4.6 & 16.4)
    const seqRow = db
      .prepare("SELECT COALESCE(MAX(confirmed_sequence), 0) + 1 as next_seq FROM ranking_events")
      .get() as { next_seq: number };
    const nextSequence = seqRow.next_seq;

    db.prepare(`
      INSERT INTO ranking_events (
        id, listing_id, transaction_id, previous_total_minor, new_total_minor,
        confirmed_sequence, confirmed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `re_${Date.now()}_${nextSequence}`,
      params.listingId,
      txId,
      previousTotalMinor,
      newTotalMinor,
      nextSequence,
      verifiedPaymentTimestamp
    );

    // 7. Claim the unique outbid slot for this category and amount
    if (existingSlot) {
      db.prepare(`
        UPDATE outbid_slots
        SET 
          status = 'claimed',
          claimed_by_listing_id = ?,
          claimed_transaction_id = ?,
          payment_timestamp = ?,
          confirmed_sequence = ?,
          updated_at = ?
        WHERE slot_id = ?
      `).run(params.listingId, txId, verifiedPaymentTimestamp, nextSequence, nowIso, slotId);
    } else {
      db.prepare(`
        INSERT INTO outbid_slots (
          slot_id, category_id, category_slug, category_name, amount_dollars, amount_minor,
          status, claimed_by_listing_id, claimed_transaction_id, payment_timestamp,
          confirmed_sequence, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'claimed', ?, ?, ?, ?, ?, ?)
      `).run(
        slotId,
        listing.category_id,
        categorySlug,
        categoryName,
        targetDollars,
        newTotalMinor,
        params.listingId,
        txId,
        verifiedPaymentTimestamp,
        nextSequence,
        nowIso,
        nowIso
      );
    }

    // 8. Update or insert daily spend for today
    const existingDaily = db
      .prepare("SELECT * FROM daily_listing_totals WHERE utc_date = ? AND listing_id = ?")
      .get(todayUtc, params.listingId) as { spend_minor: number } | undefined;

    if (existingDaily) {
      db.prepare(`
        UPDATE daily_listing_totals
        SET 
          spend_minor = spend_minor + ?,
          ranking_sequence = ?,
          updated_at = ?
        WHERE utc_date = ? AND listing_id = ?
      `).run(params.amountMinor, nextSequence, nowIso, todayUtc, params.listingId);
    } else {
      db.prepare(`
        INSERT INTO daily_listing_totals (
          id, utc_date, listing_id, spend_minor, ranking_sequence, rank, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 0, ?, ?)
      `).run(
        `daily_${todayUtc}_${params.listingId}`,
        todayUtc,
        params.listingId,
        params.amountMinor,
        nextSequence,
        nowIso,
        nowIso
      );
    }

    return {
      success: true,
      listingId: params.listingId,
      previousTotalMinor,
      newTotalMinor,
      confirmedSequence: nextSequence,
      slotId,
    };
  });

  return executeAtomicPayment();
}

