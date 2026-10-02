/**
 * overcall.lol — Core TypeScript Domain Types & Data Models
 * Reference: Section 16 & Section 18 of overcall_lol.md
 */

export type ListingStatus = "active" | "pending" | "hidden" | "suspended" | "removed";

export type IdentityType = "website" | "streaming" | "social" | "other";

export type TransactionType = "initial" | "raise" | "adjustment";

export type TransactionStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export type ReportStatus = "pending" | "reviewed" | "actioned" | "dismissed";

/**
 * Category Model: Represents the hierarchical music taxonomy.
 * Top-level is "Artist", secondary is "Music", followed by specific music subcategories.
 */
export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  level: number;
  sort_order: number;
  is_active: number; // 1 = active, 0 = inactive
  created_at: string;
  updated_at: string;
  // Computed / aggregated count
  listing_count?: number;
  top_artist_name?: string | null;
  top_bid_minor?: number;
}

/**
 * Listing Model: Public artist entry on the leaderboard.
 * Identity is canonicalized by URL.
 */
export interface Listing {
  id: string;
  canonical_identity: string;
  identity_type: IdentityType;
  display_name: string;
  slug: string;
  description: string;
  destination_url: string;
  image_url: string | null;
  status: ListingStatus;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  listed_at: string;
  first_payment_at: string | null;
  last_payment_at: string | null;
  total_paid_minor: number; // Integer cents (USD)
  click_count: number;
  created_at: string;
  updated_at: string;
  // Derived/Computed values for leaderboard views
  rank?: number;
  today_spend_minor?: number;
  today_rank?: number;
  confirmed_sequence?: number;
}

/**
 * BidTransaction: Immutable financial ledger of payments.
 */
export interface BidTransaction {
  id: string;
  listing_id: string;
  provider_transaction_id: string;
  provider_event_id: string | null;
  amount_minor: number;
  currency: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  confirmed_at: string | null;
  created_at: string;
  metadata: string | null; // JSON string
}

/**
 * RankingEvent: Monotonic sequence log of rank determination events.
 */
export interface RankingEvent {
  id: string;
  listing_id: string;
  transaction_id: string;
  previous_total_minor: number;
  new_total_minor: number;
  confirmed_sequence: number;
  confirmed_at: string;
}

/**
 * DailyListingTotal: Daily spend aggregate for a specific UTC date.
 */
export interface DailyListingTotal {
  id: string;
  utc_date: string; // YYYY-MM-DD
  listing_id: string;
  spend_minor: number;
  ranking_sequence: number;
  rank: number;
  created_at: string;
  updated_at: string;
  // Join properties
  display_name?: string;
  slug?: string;
  image_url?: string | null;
  category_name?: string;
  destination_url?: string;
}

/**
 * ClickEvent: Outbound redirect tracking log.
 */
export interface ClickEvent {
  id: string;
  listing_id: string;
  occurred_at: string;
  date_utc: string;
  session_hash: string | null;
  user_agent_hash: string | null;
  referrer: string | null;
  is_bot: number; // 0 = human, 1 = bot
}

/**
 * Report: User-submitted moderation flag against a listing.
 */
export interface Report {
  id: string;
  listing_id: string;
  reporter_email: string | null;
  reason: string;
  description: string;
  status: ReportStatus;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  listing_name?: string;
  listing_slug?: string;
}

/**
 * AdminAuditLog: Audit trail for administrative actions.
 */
export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_json: string | null;
  after_json: string | null;
  reason: string;
  created_at: string;
}

/**
 * Identity Validation DTO: Pre-checkout quote & raise calculation.
 */
export interface ValidateIdentityRequest {
  identity: string;
  desiredTotalDollars: number;
}

export interface ValidateIdentityResponse {
  canonicalIdentity: string;
  existing: boolean;
  listingId?: string;
  displayName?: string;
  currentTotalMinor: number;
  requestedTotalMinor: number;
  incrementMinor: number;
  currentRank: number | null;
  estimatedRank: number;
  currentNumberOneMinor: number;
  amountNeededForNumberOneMinor: number;
  categorySlug?: string;
  description?: string;
}

/**
 * Checkout Request DTO
 */
export interface CheckoutRequest {
  identity: string;
  displayName: string;
  description: string;
  categorySlug: string;
  desiredTotalDollars: number;
  imageUrl?: string;
}

export interface CheckoutResponse {
  checkoutId: string;
  checkoutUrl: string;
  amountMinor: number;
  currency: string;
  isRaise: boolean;
  listingId: string;
  provider: string;
  slotId: string;
}

/**
 * Unique Outbid Slot Model
 * Unique per category and outbid dollar amount (e.g. slot_electronic_1501)
 */
export interface OutbidSlot {
  slot_id: string;
  category_id: string;
  category_slug: string;
  category_name: string;
  amount_dollars: number;
  amount_minor: number;
  status: "available" | "claimed";
  claimed_by_listing_id: string | null;
  claimed_transaction_id: string | null;
  payment_timestamp: string | null;
  confirmed_sequence: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Concurrency Outbid Conflict Response
 * Returned when another payment took the slot with an earlier timestamp
 */
export interface OutbidConflictResponse {
  conflict: boolean;
  status: "failed";
  reason: "somebody_else_outbid";
  slotId: string;
  amountDollars: number;
  categoryName: string;
  message: string;
  paymentTimestamp?: string;
  conflictingTimestamp?: string;
}

/**
 * Leaderboard Query Parameters
 */
export interface LeaderboardQueryParams {
  timeframe: "all-time" | "today";
  categorySlug?: string;
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Platform Stats Aggregation
 */
export interface PlatformStats {
  totalArtists: number;
  totalVolumeMinor: number;
  totalClicks: number;
  artistsAddedToday: number;
  todayVolumeMinor: number;
  highestBidMinor: number;
}

