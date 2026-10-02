/**
 * overcall.lol — Category Taxonomy Service
 * Reference: Section 1.3, Section 5.5, Section 16.2 of overcall_lol.md
 */

import { getDb } from "../db";
import type { Category } from "@/types";

/**
 * Returns all active music subcategories with active listing counts and top artist information.
 */
export function getCategoriesWithStats(): Category[] {
  const db = getDb();

  const query = `
    SELECT 
      c.*,
      COUNT(DISTINCT l.id) as listing_count,
      (
        SELECT l2.display_name 
        FROM listings l2 
        WHERE l2.category_id = c.id AND l2.status = 'active'
        ORDER BY l2.total_paid_minor DESC, l2.listed_at ASC
        LIMIT 1
      ) as top_artist_name,
      (
        SELECT MAX(l3.total_paid_minor)
        FROM listings l3
        WHERE l3.category_id = c.id AND l3.status = 'active'
      ) as top_bid_minor
    FROM categories c
    LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'active'
    WHERE c.is_active = 1
    GROUP BY c.id
    ORDER BY c.sort_order ASC
  `;

  return db.prepare(query).all() as Category[];
}

/**
 * Finds a category by its slug.
 */
export function getCategoryBySlug(slug: string): Category | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM categories WHERE slug = ? AND is_active = 1")
    .get(slug) as Category | undefined;

  return row || null;
}
