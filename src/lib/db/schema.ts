/**
 * overcall.lol — Relational SQLite Database Schema
 * Reference: Section 16 & Section 17 of overcall_lol.md
 */

export const SCHEMA_SQL = `
-- 1. Music and Artist Taxonomy (Section 16.2)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- 2. Public Artist Listings (Section 16.1)
CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  canonical_identity TEXT UNIQUE NOT NULL,
  identity_type TEXT NOT NULL DEFAULT 'website',
  display_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  destination_url TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  category_id TEXT NOT NULL,
  listed_at TEXT NOT NULL,
  first_payment_at TEXT,
  last_payment_at TEXT,
  total_paid_minor INTEGER NOT NULL DEFAULT 0 CHECK (total_paid_minor >= 0),
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_listings_slug ON listings(slug);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_total_paid ON listings(total_paid_minor DESC);

-- 3. Bid Transactions Ledger (Section 16.3)
CREATE TABLE IF NOT EXISTS bid_transactions (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  provider_transaction_id TEXT UNIQUE NOT NULL,
  provider_event_id TEXT UNIQUE,
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  transaction_type TEXT NOT NULL, -- 'initial', 'raise', 'adjustment'
  status TEXT NOT NULL,           -- 'pending', 'paid', 'failed', 'refunded', 'cancelled'
  confirmed_at TEXT,
  created_at TEXT NOT NULL,
  metadata TEXT,                  -- JSON string
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tx_listing ON bid_transactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_tx_status ON bid_transactions(status);
CREATE INDEX IF NOT EXISTS idx_tx_provider ON bid_transactions(provider_transaction_id);

-- 4. Monotonic Ranking Events (Section 16.4)
CREATE TABLE IF NOT EXISTS ranking_events (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  previous_total_minor INTEGER NOT NULL,
  new_total_minor INTEGER NOT NULL,
  confirmed_sequence INTEGER UNIQUE NOT NULL,
  confirmed_at TEXT NOT NULL,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES bid_transactions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ranking_seq ON ranking_events(confirmed_sequence ASC);
CREATE INDEX IF NOT EXISTS idx_ranking_listing ON ranking_events(listing_id);

-- 5. Daily Listing Spend Totals (Section 16.5)
CREATE TABLE IF NOT EXISTS daily_listing_totals (
  id TEXT PRIMARY KEY,
  utc_date TEXT NOT NULL, -- YYYY-MM-DD
  listing_id TEXT NOT NULL,
  spend_minor INTEGER NOT NULL DEFAULT 0,
  ranking_sequence INTEGER NOT NULL,
  rank INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(utc_date, listing_id),
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_daily_date ON daily_listing_totals(utc_date);
CREATE INDEX IF NOT EXISTS idx_daily_spend ON daily_listing_totals(utc_date, spend_minor DESC);

-- 6. Outbound Click Events (Section 16.6)
CREATE TABLE IF NOT EXISTS click_events (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  date_utc TEXT NOT NULL,
  session_hash TEXT,
  user_agent_hash TEXT,
  referrer TEXT,
  is_bot INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_clicks_listing ON click_events(listing_id);
CREATE INDEX IF NOT EXISTS idx_clicks_date ON click_events(date_utc);

-- 7. Moderation Reports (Section 16.7)
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  reporter_email TEXT,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  resolved_by TEXT,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- 8. Admin Audit Logs (Section 16.8)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  reason TEXT,
  created_at TEXT NOT NULL
);

-- 9. Outbid Slots (Section 16.9 - Unique Outbid Slot Identifiers & Timestamp-Based Settlement)
CREATE TABLE IF NOT EXISTS outbid_slots (
  slot_id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  category_name TEXT NOT NULL,
  amount_dollars INTEGER NOT NULL,
  amount_minor INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'claimed'
  claimed_by_listing_id TEXT,
  claimed_transaction_id TEXT,
  payment_timestamp TEXT,
  confirmed_sequence INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (claimed_by_listing_id) REFERENCES listings(id) ON DELETE SET NULL,
  FOREIGN KEY (claimed_transaction_id) REFERENCES bid_transactions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_slots_category ON outbid_slots(category_slug);
CREATE INDEX IF NOT EXISTS idx_slots_status ON outbid_slots(status);

-- 10. Champion Testimonials (From the people who took #1)
CREATE TABLE IF NOT EXISTS champion_testimonials (
  id TEXT PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_initials TEXT NOT NULL,
  quote_text TEXT NOT NULL,
  date_label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_testimonials_active ON champion_testimonials(is_active);
`;

