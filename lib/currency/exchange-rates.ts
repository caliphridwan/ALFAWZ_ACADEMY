import "server-only";

/**
 * Open ER-API (https://www.exchangerate-api.com/docs/free) — free, no API
 * key required, updated roughly daily. Good enough for a "here's roughly
 * what this costs in your currency" reference; this is never used to
 * actually charge anyone (Paystack always charges in the course's own
 * `currency`, as Section 41 requires), so API precision/rate-limits here
 * are low-stakes.
 */
const RATES_API_BASE = "https://open.er-api.com/v6/latest";

// Currencies worth offering a diaspora family a conversion into. Extend
// this list if other regions become relevant — it doesn't need to match
// every currency the API supports.
export const DISPLAY_CURRENCIES = ["NGN", "USD", "GBP", "EUR", "CAD"] as const;
export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];

export type ExchangeRates = {
  base: string;
  /** Rate to multiply an amount in `base` by, to get the amount in that currency. */
  rates: Partial<Record<DisplayCurrency, number>>;
  fetchedAt: string;
};

/**
 * Fetches conversion rates from `base` into DISPLAY_CURRENCIES. Cached by
 * Next's fetch cache for 12 hours (via the `next.revalidate` option) so a
 * burst of page views doesn't re-hit the external API every time, and
 * returns null — never throws — on any failure, so a currency-API outage
 * can never break a course page or block enrollment.
 */
export async function getExchangeRates(base: string): Promise<ExchangeRates | null> {
  try {
    const res = await fetch(`${RATES_API_BASE}/${encodeURIComponent(base)}`, {
      next: { revalidate: 60 * 60 * 12 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.result !== "success" || !data.rates) return null;

    const rates: Partial<Record<DisplayCurrency, number>> = {};
    for (const code of DISPLAY_CURRENCIES) {
      if (typeof data.rates[code] === "number") rates[code] = data.rates[code];
    }

    return { base, rates, fetchedAt: data.time_last_update_utc ?? new Date().toISOString() };
  } catch (err) {
    console.error("Failed to fetch exchange rates:", err);
    return null;
  }
}
