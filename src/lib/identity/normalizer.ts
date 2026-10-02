/**
 * overcall.lol — Identity Normalizer & URL Canonicalization
 * Reference: Section 4.1, Section 7.1, Section 7.2 of overcall_lol.md
 */

/**
 * Normalizes an artist URL into a canonical identity key.
 * Rules:
 * 1. Must use HTTP or HTTPS (defaults to HTTPS if protocol missing).
 * 2. Lowercases hostname.
 * 3. Removes URL fragment (#...).
 * 4. Strips tracking query parameters (utm_*, ref, fbclid, etc.).
 * 5. Removes redundant default ports (:80, :443).
 * 6. Strips trailing slashes from path unless it's root.
 */
export function normalizeIdentity(rawInput: string): string {
  let cleaned = rawInput.trim();

  // If no scheme provided, prepend https://
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    throw new Error("Invalid URL format. Please provide a valid artist web link.");
  }

  // Enforce safe schemes
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS links are allowed.");
  }

  // Reject local/private network addresses (SSRF prevention - Section 28.2)
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.endsWith(".local")
  ) {
    throw new Error("Private or local network links are not permitted.");
  }

  // List of common marketing/analytics query parameters to strip
  const trackingParams = [
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "fbclid", "gclid", "msclkid", "ref", "source", "feature", "si"
  ];

  trackingParams.forEach((param) => {
    parsed.searchParams.delete(param);
  });

  // Sort query parameters for deterministic canonical identity
  parsed.searchParams.sort();

  // Normalize path: strip trailing slash
  let pathname = parsed.pathname;
  if (pathname === "/" || (pathname.length > 1 && pathname.endsWith("/"))) {
    pathname = pathname.replace(/\/+$/, "");
  }

  // Canonical format
  const port = (parsed.port === "80" && parsed.protocol === "http:") ||
               (parsed.port === "443" && parsed.protocol === "https:")
               ? ""
               : (parsed.port ? `:${parsed.port}` : "");

  const search = parsed.searchParams.toString() ? `?${parsed.searchParams.toString()}` : "";

  return `${parsed.protocol}//${hostname}${port}${pathname}${search}`;
}

/**
 * Generates a clean URL slug from artist display name
 */
export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || `artist-${Math.floor(Math.random() * 89999 + 10000)}`;
}

/**
 * Automatically extracts the favicon URL for any given website or link.
 * Uses Google S2 high-resolution 128px favicon service which works reliably across all web domains.
 */
export function getFaviconUrl(url: string, size = 128): string {
  if (!url) return "";
  try {
    const cleaned = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    const parsed = new URL(cleaned);
    const domain = parsed.hostname.replace(/^www\./, "");
    if (!domain) return "";
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
  } catch {
    return "";
  }
}
