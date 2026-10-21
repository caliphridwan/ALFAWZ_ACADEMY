// Shared between the server-only fetcher (exchange-rates.ts) and the client
// component (components/courses/currency-converter.tsx) — kept in its own
// file with no "server-only" import so the client bundle can safely import
// these types/constants without pulling the server-only sentinel in too.

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
