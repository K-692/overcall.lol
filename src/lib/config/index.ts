/**
 * overcall.lol — Application Configuration & Financial Constants
 * Reference: Section 4.2, Section 8.6, Section 37 of overcall_lol.md
 */

export const APP_CONFIG = {
  appName: process.env.APP_NAME || "overcall.lol",
  appDomain: process.env.NEXT_PUBLIC_APP_DOMAIN || "overcall.lol",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://overcall.lol",
  currency: process.env.APP_CURRENCY || "USD",

  // Minimum initial bid starts with $1 (100 cents)
  minInitialBidMinor: parseInt(process.env.MIN_INITIAL_BID_MINOR || "100", 10),

  // Section 4.4: Minimum raise: $1 (100 cents)
  minRaiseMinor: parseInt(process.env.MIN_RAISE_MINOR || "100", 10),

  // Section 4.2: Maximum bid: $999,999 (99,999,900 cents)
  maxBidMinor: parseInt(process.env.MAX_BID_MINOR || "99999900", 10),

  // Default page size for leaderboards
  pageSize: 50,

  // UTC Calendar boundary rule (Section 4.8)
  dayTimezone: "UTC",

  // Polling interval in ms for client-side live board refresh (Section 20)
  pollingIntervalMs: 20000,
} as const;

/**
 * Format integer cents into standard USD string (e.g. 5000 -> "$50", 100500 -> "$1,005")
 */
export function formatCurrency(amountMinor: number, currency: string = APP_CONFIG.currency): string {
  const dollars = amountMinor / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: dollars % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Convert whole dollars to minor units (cents) safely without floating point inaccuracies
 */
export function dollarsToMinor(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert minor units (cents) to whole or decimal dollars
 */
export function minorToDollars(minor: number): number {
  return minor / 100;
}
