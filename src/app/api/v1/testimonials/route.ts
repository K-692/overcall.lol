import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type Database from "better-sqlite3";

export const dynamic = "force-dynamic";

function ensureTestimonialsTable(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS champion_testimonials (
      id TEXT PRIMARY KEY,
      author_name TEXT NOT NULL,
      author_handle TEXT NOT NULL,
      author_initials TEXT NOT NULL,
      quote_text TEXT NOT NULL,
      date_label TEXT NOT NULL,
      post_url TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_testimonials_active ON champion_testimonials(is_active);
  `);

  try {
    db.exec("ALTER TABLE champion_testimonials ADD COLUMN post_url TEXT NOT NULL DEFAULT ''");
  } catch {
    // Column already exists
  }

  const count = db.prepare("SELECT COUNT(*) as count FROM champion_testimonials").get() as { count: number };
  if (count.count === 0) {
    const now = new Date().toISOString();
    const insert = db.prepare(`
      INSERT INTO champion_testimonials (
        id, author_name, author_handle, author_initials, quote_text, date_label, post_url, sort_order, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    insert.run(
      "testi_1",
      "MakerThrive",
      "@MakerThrive",
      "MT",
      "this is WILD!!!\nspent $42 on overcall.lol\ndrove 64,000 people to our product\ngenerated $29k in one day.\ninsane ROI!",
      "Aug 24",
      "https://x.com/MakerThrive",
      1,
      now,
      now
    );

    insert.run(
      "testi_2",
      "Lewis ⚡ soc2/acc",
      "@lewiscarhart",
      "LC",
      "Update:\nThe sales team at Comp AI approve.\nWe have a 30% win rate across all demos, average 14-day from demo to close, LTV from one win from the ad would be expected to be $40,000+ 🥇",
      "Aug 21",
      "https://x.com/lewiscarhart",
      2,
      now,
      now
    );

    insert.run(
      "testi_3",
      "CrowdReply",
      "@Crowdreply_io",
      "CR",
      "Okay, let us summarize the past 48 hours for you\n- We bought the #1 spot on overcall.lol for $12,700\n- Trended on X\n- 6,550+ clicks\n- 1,800 signups\n- 50+ demo calls fully booked for the next 2 weeks\n- $50k/mo currently in the pipeline\nWas it worth it? ABSOLUTELY YES",
      "Aug 23",
      "https://x.com/Crowdreply_io",
      3,
      now,
      now
    );

    insert.run(
      "testi_4",
      "Tibo",
      "@tibo_maker",
      "TB",
      "result from my overcall bet - it was successful 🔥\nPaid for the #1 spot.\nHere is what actually happened:\n- 44 trials on Friday\n- 38 trials on Saturday\n- 31 trials on Sunday\nNormal baseline: ~20 trials/day. 53 new trials that would not exist otherwise!",
      "Aug 24",
      "https://x.com/tibo_maker",
      4,
      now,
      now
    );
  } else {
    // Ensure default post URLs are populated if empty
    db.prepare(`
      UPDATE champion_testimonials 
      SET post_url = 'https://x.com/' || REPLACE(author_handle, '@', '')
      WHERE post_url IS NULL OR post_url = ''
    `).run();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";

    const db = getDb();
    ensureTestimonialsTable(db);

    const query = includeAll
      ? "SELECT id, author_name, author_handle, author_initials, quote_text, date_label, post_url, sort_order, is_active, created_at, updated_at FROM champion_testimonials ORDER BY sort_order ASC, created_at DESC"
      : "SELECT id, author_name, author_handle, author_initials, quote_text, date_label, post_url, sort_order FROM champion_testimonials WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC";

    const rows = db.prepare(query).all();

    return NextResponse.json({ items: rows });
  } catch (err) {
    console.error("Failed to fetch testimonials:", err);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      authorName,
      authorHandle,
      authorInitials,
      quoteText,
      dateLabel,
      postUrl,
      sortOrder = 0,
    } = body;

    if (!authorName || !quoteText) {
      return NextResponse.json(
        { error: "Author name and quote text are required." },
        { status: 400 }
      );
    }

    const db = getDb();
    ensureTestimonialsTable(db);

    const id = `testi_${Date.now()}`;
    const now = new Date().toISOString();
    const cleanHandle = (authorHandle || "").trim();
    const resolvedPostUrl = (postUrl || "").trim() || `https://x.com/${cleanHandle.replace(/^@/, "")}`;

    db.prepare(`
      INSERT INTO champion_testimonials (
        id, author_name, author_handle, author_initials, quote_text, date_label, post_url, sort_order, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(
      id,
      authorName.trim(),
      cleanHandle,
      (authorInitials || authorName.slice(0, 2)).toUpperCase(),
      quoteText.trim(),
      dateLabel || "Recent",
      resolvedPostUrl,
      sortOrder,
      now,
      now
    );

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("Failed to add testimonial:", err);
    return NextResponse.json({ error: "Failed to add testimonial" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, author_name, author_handle, author_initials, quote_text, date_label, post_url, sort_order, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required to update a testimonial." }, { status: 400 });
    }

    const db = getDb();
    ensureTestimonialsTable(db);

    const existing = db.prepare("SELECT * FROM champion_testimonials WHERE id = ?").get(id);
    if (!existing) {
      return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE champion_testimonials
      SET author_name = COALESCE(?, author_name),
          author_handle = COALESCE(?, author_handle),
          author_initials = COALESCE(?, author_initials),
          quote_text = COALESCE(?, quote_text),
          date_label = COALESCE(?, date_label),
          post_url = COALESCE(?, post_url),
          sort_order = COALESCE(?, sort_order),
          is_active = COALESCE(?, is_active),
          updated_at = ?
      WHERE id = ?
    `).run(
      author_name !== undefined ? author_name.trim() : null,
      author_handle !== undefined ? author_handle.trim() : null,
      author_initials !== undefined ? author_initials.trim().toUpperCase() : null,
      quote_text !== undefined ? quote_text.trim() : null,
      date_label !== undefined ? date_label.trim() : null,
      post_url !== undefined ? post_url.trim() : null,
      sort_order !== undefined ? Number(sort_order) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      now,
      id
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update testimonial:", err);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required." }, { status: 400 });
    }

    const db = getDb();
    ensureTestimonialsTable(db);

    db.prepare("DELETE FROM champion_testimonials WHERE id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete testimonial:", err);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
