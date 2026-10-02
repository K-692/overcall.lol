/**
 * overcall.lol — SQLite Database Singleton Connection
 * Reference: Section 16 & Section 22 of overcall_lol.md
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { seedDatabase } from "./seed";

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "overcall.db");

declare global {
  // eslint-disable-next-line no-var
  var __overcallDb: Database.Database | undefined;
}

export function getDb(): Database.Database {
  if (global.__overcallDb) {
    return global.__overcallDb;
  }

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Set timeout to 15 seconds to prevent SQLITE_BUSY across concurrent build workers
  const db = new Database(DB_PATH, { timeout: 15000 });

  try {
    db.pragma("journal_mode = WAL");
  } catch {
    // Already set or locked by another worker
  }

  try {
    db.pragma("foreign_keys = ON");
    db.pragma("busy_timeout = 15000");
  } catch {
    // Ignore pragma lock
  }

  // Run schema migration and seed
  try {
    seedDatabase(db);
  } catch (err) {
    // If another thread is currently seeding, wait or ignore
    console.warn("Database initialization notice:", err);
  }

  if (process.env.NODE_ENV !== "production") {
    global.__overcallDb = db;
  }

  return db;
}
