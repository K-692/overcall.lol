/**
 * overcall.lol — Outbound Click Tracking & Anti-Bot Service
 * Reference: Section 13 of overcall_lol.md
 */

import { getDb } from "../db";
import { getCurrentUtcDate } from "../ranking/rankCalculator";

const BOT_USER_AGENTS = [
  /googlebot/i,
  /bingbot/i,
  /yandex/i,
  /baiduspider/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /rogerbot/i,
  /linkedinbot/i,
  /embedly/i,
  /quora link preview/i,
  /showyoubot/i,
  /outbrain/i,
  /pinterest\/0\./i,
  /developers\.google\.com\/\+\/web\/snippet/i,
  /slackbot/i,
  /vkshare/i,
  /w3c_validator/i,
  /redditbot/i,
  /applebot/i,
  /whatsapp/i,
  /flipboard/i,
  /tumblr/i,
  /bitlybot/i,
  /skypeuripreview/i,
  /nuzzel/i,
  /discordbot/i,
  /google page speed/i,
  /qwantify/i,
  /pinterestbot/i,
  /bitrix link preview/i,
  /xing-content-crawler/i,
  /telegrambot/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /headlesschrome/i,
];

/**
 * Checks if a user agent string belongs to a known automated bot or crawler.
 */
export function isBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return true;
  return BOT_USER_AGENTS.some((regex) => regex.test(userAgent));
}

/**
 * Records an outbound click event and increments the listing's public click count if not a bot.
 */
export function recordOutboundClick(
  listingId: string,
  userAgent: string | null,
  referrer: string | null
): { destinationUrl: string } | null {
  const db = getDb();

  const listing = db
    .prepare("SELECT destination_url, status FROM listings WHERE id = ?")
    .get(listingId) as { destination_url: string; status: string } | undefined;

  if (!listing || listing.status === "removed") {
    return null;
  }

  const isBot = isBotUserAgent(userAgent) ? 1 : 0;
  const nowIso = new Date().toISOString();
  const dateUtc = getCurrentUtcDate();

  // Insert click event log
  const clickId = `clk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  db.prepare(`
    INSERT INTO click_events (
      id, listing_id, occurred_at, date_utc, user_agent_hash, referrer, is_bot
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    clickId,
    listingId,
    nowIso,
    dateUtc,
    userAgent ? userAgent.slice(0, 100) : null,
    referrer ? referrer.slice(0, 200) : null,
    isBot
  );

  // If not a bot, increment public counter on listing
  if (!isBot) {
    db.prepare(`
      UPDATE listings 
      SET click_count = click_count + 1 
      WHERE id = ?
    `).run(listingId);
  }

  return { destinationUrl: listing.destination_url };
}
