/**
 * overcall.lol — Seed Data Engine
 * Reference: Section 1.3 & Section 16 of overcall_lol.md
 */

import type Database from "better-sqlite3";
import { SCHEMA_SQL } from "./schema";

export const SEED_CATEGORIES = [
  { name: "Electronic", slug: "electronic", sort_order: 1 },
  { name: "Hip-Hop", slug: "hip-hop", sort_order: 2 },
  { name: "Pop", slug: "pop", sort_order: 3 },
  { name: "Indie", slug: "indie", sort_order: 4 },
  { name: "R&B", slug: "rnb-soul", sort_order: 5 },
  { name: "Rock", slug: "rock", sort_order: 6 },
  { name: "K-Pop", slug: "k-pop", sort_order: 7 },
  { name: "Metal", slug: "metal", sort_order: 8 },
  { name: "Jazz", slug: "jazz", sort_order: 9 },
  { name: "Latin", slug: "latin", sort_order: 10 },
  { name: "Classical", slug: "classical", sort_order: 11 },
  { name: "Folk", slug: "folk-acoustic", sort_order: 12 },
  { name: "Country", slug: "country", sort_order: 13 },
  { name: "J-Pop", slug: "j-pop", sort_order: 14 },
  { name: "Reggae", slug: "reggae", sort_order: 15 },
  { name: "Blues", slug: "blues", sort_order: 16 },
  { name: "Devotional", slug: "devotional", sort_order: 17 },
  { name: "Other", slug: "other", sort_order: 18 },
];

export const INITIAL_ARTISTS = [
  {
    name: "Spotify Music",
    slug: "spotify-music",
    categorySlug: "electronic",
    description: "Millions of songs, playlists, and podcasts on the global streaming platform.",
    url: "https://open.spotify.com",
    imageUrl: null,
    bidTotal: 250000, // $2,500.00
    todaySpend: 45000, // $450.00
    clicks: 2840,
    daysAgo: 14,
  },
  {
    name: "SoundCloud",
    slug: "soundcloud",
    categorySlug: "hip-hop",
    description: "Next-gen music discovery, creator community, and trending underground tapes.",
    url: "https://soundcloud.com",
    imageUrl: null,
    bidTotal: 210000, // $2,100.00
    todaySpend: 38000, // $380.00
    clicks: 2190,
    daysAgo: 12,
  },
  {
    name: "Bandcamp",
    slug: "bandcamp",
    categorySlug: "indie",
    description: "Direct-to-fan independent music community, digital albums & vinyl releases.",
    url: "https://bandcamp.com",
    imageUrl: null,
    bidTotal: 180000, // $1,800.00
    todaySpend: 32000, // $320.00
    clicks: 1750,
    daysAgo: 10,
  },
  {
    name: "YouTube Music",
    slug: "youtube-music",
    categorySlug: "pop",
    description: "Official music videos, singles, remixes, and live music performances.",
    url: "https://music.youtube.com",
    imageUrl: null,
    bidTotal: 150000, // $1,500.00
    todaySpend: 27000, // $270.00
    clicks: 1420,
    daysAgo: 9,
  },
  {
    name: "Apple Music",
    slug: "apple-music",
    categorySlug: "rnb-soul",
    description: "Spatial audio, lossless streaming, and curated artist radio shows.",
    url: "https://music.apple.com",
    imageUrl: null,
    bidTotal: 125000, // $1,250.00
    todaySpend: 22000, // $220.00
    clicks: 1180,
    daysAgo: 8,
  },
  {
    name: "Pitchfork",
    slug: "pitchfork",
    categorySlug: "rock",
    description: "The most trusted voice in music journalism, reviews, and features.",
    url: "https://pitchfork.com",
    imageUrl: null,
    bidTotal: 95000, // $950.00
    todaySpend: 18000, // $180.00
    clicks: 890,
    daysAgo: 7,
  },
  {
    name: "Tidal HiFi",
    slug: "tidal-hifi",
    categorySlug: "jazz",
    description: "High-fidelity sound, Master quality audio, and artist-first royalties.",
    url: "https://tidal.com",
    imageUrl: null,
    bidTotal: 72000, // $720.00
    todaySpend: 14000, // $140.00
    clicks: 650,
    daysAgo: 6,
  },
  {
    name: "Mixcloud",
    slug: "mixcloud",
    categorySlug: "electronic",
    description: "Radio shows, podcast sets, and live DJ club broadcasts.",
    url: "https://mixcloud.com",
    imageUrl: null,
    bidTotal: 55000, // $550.00
    todaySpend: 11000, // $110.00
    clicks: 510,
    daysAgo: 5,
  },
  {
    name: "Audiomack",
    slug: "audiomack",
    categorySlug: "hip-hop",
    description: "Move music forward with free, unlimited hip-hop streaming.",
    url: "https://audiomack.com",
    imageUrl: null,
    bidTotal: 42000, // $420.00
    todaySpend: 8500, // $85.00
    clicks: 430,
    daysAgo: 4,
  },
  {
    name: "GitHub Open Audio",
    slug: "github-audio",
    categorySlug: "metal",
    description: "Open source audio synthesis engines, DSP plugins, and tracker projects.",
    url: "https://github.com",
    imageUrl: null,
    bidTotal: 31000, // $310.00
    todaySpend: 6000, // $60.00
    clicks: 350,
    daysAgo: 3,
  },
  {
    name: "Wikipedia Discography",
    slug: "wikipedia-music",
    categorySlug: "classical",
    description: "Comprehensive encyclopedic archive of musical history and discographies.",
    url: "https://wikipedia.org",
    imageUrl: null,
    bidTotal: 20000, // $200.00
    todaySpend: 4000, // $40.00
    clicks: 260,
    daysAgo: 2,
  },
  {
    name: "BBC Sounds",
    slug: "bbc-sounds",
    categorySlug: "folk-acoustic",
    description: "Live BBC radio stations, exclusive music mixes, and live recordings.",
    url: "https://bbc.co.uk",
    imageUrl: null,
    bidTotal: 12000, // $120.00
    todaySpend: 2000, // $20.00
    clicks: 190,
    daysAgo: 1,
  },
];

export const SEED_TESTIMONIALS = [
  {
    id: "testi_1",
    authorName: "MakerThrive",
    authorHandle: "@MakerThrive",
    authorInitials: "MT",
    quoteText: "this is WILD!!!\nspent $42 on overcall.lol\ndrove 64,000 listeners to our streaming discography.\ngenerated $29k in digital album sales in one day.\ninsane ROI!",
    dateLabel: "Aug 24",
    sortOrder: 1,
  },
  {
    id: "testi_2",
    authorName: "Lewis ⚡ AudioAI",
    authorHandle: "@lewiscarhart",
    authorInitials: "LC",
    quoteText: "Update on our #1 rank run on overcall.lol:\nThe label A&R team was blown away. 35% listener conversion across DSPs, average 14-day stream retention, and signed our first sync licensing contract for $40,000+ 🥇",
    dateLabel: "Aug 21",
    sortOrder: 2,
  },
  {
    id: "testi_3",
    authorName: "CrowdReply Music",
    authorHandle: "@Crowdreply_io",
    authorInitials: "CR",
    quoteText: "Summary of our 48 hours at #1 on overcall.lol:\n- Claimed #1 in All Genres\n- Trended across music communities\n- 8,200+ stream clicks\n- 2,400 new playlist adds\n- $45k in upcoming festival bookings\nWas it worth it? 100% YES.",
    dateLabel: "Aug 23",
    sortOrder: 3,
  },
  {
    id: "testi_4",
    authorName: "Tibo Soundworks",
    authorHandle: "@tibo_maker",
    authorInitials: "TB",
    quoteText: "Result from our #1 overcall.lol bid:\n4 days ago we took #1 for our album drop.\nMost people told me it was just flexing.\nHere is what actually happened:\n- 120 new monthly vinyl subscribers\n- 82,000 Spotify streams in 72 hours\n- 4 label inquiries\novercall.lol paid for itself in 36 hours 🔥",
    dateLabel: "Aug 25",
    sortOrder: 4,
  },
];

/**
 * Initializes tables and seeds categories and demo artists if empty.
 */
export function seedDatabase(db: Database.Database): void {
  // Execute schema
  db.exec(SCHEMA_SQL);

  // Check and seed testimonials if empty
  try {
    const testiCount = db.prepare("SELECT COUNT(*) as count FROM champion_testimonials").get() as { count: number };
    if (testiCount.count === 0) {
      const now = new Date().toISOString();
      const insertTesti = db.prepare(`
        INSERT OR IGNORE INTO champion_testimonials (
          id, author_name, author_handle, author_initials, quote_text, date_label, sort_order, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `);
      for (const t of SEED_TESTIMONIALS) {
        insertTesti.run(t.id, t.authorName, t.authorHandle, t.authorInitials, t.quoteText, t.dateLabel, t.sortOrder, now, now);
      }
    }
  } catch (err) {
    console.warn("Notice seeding champion_testimonials:", err);
  }

  // Check if categories are already populated
  const catCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
  if (catCount.count > 0) {
    // Ensure outbid_slots table has records for current active listings
    try {
      const slotCount = db.prepare("SELECT COUNT(*) as count FROM outbid_slots").get() as { count: number };
      if (slotCount.count === 0) {
        const activeListings = db.prepare(`
          SELECT l.id, l.category_id, l.total_paid_minor, l.first_payment_at, c.slug as category_slug, c.name as category_name
          FROM listings l
          JOIN categories c ON c.id = l.category_id
          WHERE l.status = 'active'
        `).all() as Array<{
          id: string;
          category_id: string;
          total_paid_minor: number;
          first_payment_at: string;
          category_slug: string;
          category_name: string;
        }>;

        const now = new Date().toISOString();
        const insertSlot = db.prepare(`
          INSERT OR IGNORE INTO outbid_slots (
            slot_id, category_id, category_slug, category_name, amount_dollars, amount_minor,
            status, claimed_by_listing_id, payment_timestamp, confirmed_sequence, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'claimed', ?, ?, 1000, ?, ?)
        `);

        for (const item of activeListings) {
          const dollars = Math.round(item.total_paid_minor / 100);
          const slotId = `slot_${item.category_slug}_${dollars}`;
          insertSlot.run(
            slotId,
            item.category_id,
            item.category_slug,
            item.category_name,
            dollars,
            item.total_paid_minor,
            item.id,
            item.first_payment_at || now,
            now,
            now
          );
        }
      }
    } catch (err) {
      console.warn("Notice checking outbid_slots:", err);
    }
    return; // Already initialized
  }


  const nowIso = new Date().toISOString();
  const todayUtc = nowIso.slice(0, 10);

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, parent_id, name, slug, level, sort_order, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
  `);

  const categoryMap = new Map<string, string>();

  // Transaction for atomic seed
  const runSeed = db.transaction(() => {
    // 1. Seed Categories
    for (const cat of SEED_CATEGORIES) {
      const id = `cat_${cat.slug}`;
      insertCategory.run(id, null, cat.name, cat.slug, 1, cat.sort_order, nowIso, nowIso);
      categoryMap.set(cat.slug, id);
    }

    // 2. Seed Initial Artists & Transactions
    const insertListing = db.prepare(`
      INSERT INTO listings (
        id, canonical_identity, identity_type, display_name, slug, description,
        destination_url, image_url, status, category_id, listed_at, first_payment_at,
        last_payment_at, total_paid_minor, click_count, created_at, updated_at
      ) VALUES (?, ?, 'website', ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertTx = db.prepare(`
      INSERT INTO bid_transactions (
        id, listing_id, provider_transaction_id, provider_event_id, amount_minor,
        currency, transaction_type, status, confirmed_at, created_at, metadata
      ) VALUES (?, ?, ?, ?, ?, 'USD', 'initial', 'paid', ?, ?, ?)
    `);

    const insertRankingEvent = db.prepare(`
      INSERT INTO ranking_events (
        id, listing_id, transaction_id, previous_total_minor, new_total_minor,
        confirmed_sequence, confirmed_at
      ) VALUES (?, ?, ?, 0, ?, ?, ?)
    `);

    const insertDaily = db.prepare(`
      INSERT INTO daily_listing_totals (
        id, utc_date, listing_id, spend_minor, ranking_sequence, rank, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `);

    let sequence = 1000;

    for (const artist of INITIAL_ARTISTS) {
      const catId = categoryMap.get(artist.categorySlug) || `cat_other`;
      const listingId = `list_${artist.slug}`;
      sequence += 1;

      const datePast = new Date(Date.now() - artist.daysAgo * 86400000).toISOString();

      insertListing.run(
        listingId,
        artist.url.toLowerCase(),
        artist.name,
        artist.slug,
        artist.description,
        artist.url,
        artist.imageUrl,
        catId,
        datePast,
        datePast,
        datePast,
        artist.bidTotal,
        artist.clicks,
        datePast,
        nowIso
      );

      const txId = `tx_seed_${artist.slug}`;
      insertTx.run(
        txId,
        listingId,
        `seed_tx_${sequence}`,
        `seed_evt_${sequence}`,
        artist.bidTotal,
        datePast,
        datePast,
        JSON.stringify({ notes: "Genesis platform listing" })
      );

      insertRankingEvent.run(
        `re_${sequence}`,
        listingId,
        txId,
        artist.bidTotal,
        sequence,
        datePast
      );

      // If artist has today's spend, populate daily table
      if (artist.todaySpend > 0) {
        insertDaily.run(
          `daily_${todayUtc}_${listingId}`,
          todayUtc,
          listingId,
          artist.todaySpend,
          sequence,
          nowIso,
          nowIso
        );
      }
    }
  });

  runSeed();
}
