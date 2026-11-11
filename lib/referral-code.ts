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
