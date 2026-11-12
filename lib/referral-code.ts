/** Pure helpers for referral codes (no database, so they are easy to test). */

export const REFERRAL_COOKIE = "afz_ref";
export const REFERRAL_COOKIE_DAYS = 30;

// No 0/O/1/I so codes are easy to read out or type from a flyer.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Uppercase and trim; returns null unless it looks like a valid code (3-24 of A-Z, 0-9, dash). */
export function normalizeCode(input: string | null | undefined): string | null {
  const code = (input ?? "").trim().toUpperCase();
  return /^[A-Z0-9-]{3,24}$/.test(code) ? code : null;
}

/** A random 6-character code. `random` is injectable for testing. */
export function generateCode(random: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < 6; i++) out += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return out;
}

/** Only allow redirects to a path on this site: "/courses" yes, "//evil.com" or "https://x" no. */
export function safeRedirectPath(to: string | null | undefined, fallback = "/register"): string {
  if (!to || !to.startsWith("/") || to.startsWith("//") || to.includes("\\")) return fallback;
  return to;
}

export function referralLink(baseUrl: string, code: string, to?: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  return `${base}/r/${code}${to ? `?to=${encodeURIComponent(to)}` : ""}`;
}

/**
 * The public address of the site for building a redirect. Behind a host's proxy, the
 * request's own URL can be an internal address (localhost:10000), which would send the
 * visitor somewhere unreachable. Prefer the configured site address, then the proxy's
 * forwarded headers, then the request URL.
 */
export function publicOrigin(opts: {
  appUrl?: string | null;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
  host?: string | null;
  requestUrl: string;
}): string {
  const clean = (v?: string | null) => (v ?? "").trim().replace(/^["']+|["']+$/g, "").trim();
  const configured = clean(opts.appUrl);
  if (configured) {
    const withProto = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
    return withProto.replace(/\/+$/, "");
  }
  const host = clean(opts.forwardedHost).split(",")[0].trim() || clean(opts.host);
  if (host && !/^(localhost|0\.0\.0\.0|127\.0\.0\.1)(:|$)/.test(host)) {
    const proto = clean(opts.forwardedProto).split(",")[0].trim() || "https";
    return `${proto}://${host}`;
  }
  return new URL(opts.requestUrl).origin;
}
