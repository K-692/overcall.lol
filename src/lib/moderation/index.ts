/**
 * overcall.lol — Moderation & Administrative Service
 * Reference: Section 14 & Section 15 of overcall_lol.md
 */

import { getDb } from "../db";
import type { Report, AdminAuditLog } from "@/types";

/**
 * Creates a public report for a listing.
 */
export function createReport(params: {
  listingId: string;
  reason: string;
  description: string;
  reporterEmail?: string;
}): string {
  const db = getDb();
  const id = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();

  db.prepare(`
    INSERT INTO reports (id, listing_id, reporter_email, reason, description, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?)
  `).run(
    id,
    params.listingId,
    params.reporterEmail || null,
    params.reason,
    params.description,
    nowIso
  );

  return id;
}

/**
 * Updates a listing moderation status with audit trail.
 */
export function updateListingStatus(params: {
  listingId: string;
  newStatus: "active" | "hidden" | "suspended" | "removed";
  adminUserId: string;
  reason: string;
}): void {
  const db = getDb();
  const nowIso = new Date().toISOString();

  const current = db
    .prepare("SELECT * FROM listings WHERE id = ?")
    .get(params.listingId);

  if (!current) {
    throw new Error("Listing not found.");
  }

  const runUpdate = db.transaction(() => {
    db.prepare("UPDATE listings SET status = ?, updated_at = ? WHERE id = ?").run(
      params.newStatus,
      nowIso,
      params.listingId
    );

    // Audit log (Section 15.4)
    db.prepare(`
      INSERT INTO admin_audit_logs (
        id, admin_user_id, action, entity_type, entity_id, before_json, after_json, reason, created_at
      ) VALUES (?, ?, 'update_status', 'listing', ?, ?, ?, ?, ?)
    `).run(
      `aud_${Date.now()}`,
      params.adminUserId,
      params.listingId,
      JSON.stringify(current),
      JSON.stringify({ ...current, status: params.newStatus }),
      params.reason,
      nowIso
    );
  });

  runUpdate();
}

/**
 * Fetches all reports with associated listing details.
 */
export function getReports(): Report[] {
  const db = getDb();
  return db
    .prepare(`
      SELECT 
        r.*,
        l.display_name as listing_name,
        l.slug as listing_slug
      FROM reports r
      LEFT JOIN listings l ON l.id = r.listing_id
      ORDER BY r.created_at DESC
    `)
    .all() as Report[];
}

/**
 * Fetches administrative audit logs.
 */
export function getAdminAuditLogs(): AdminAuditLog[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 100")
    .all() as AdminAuditLog[];
}
