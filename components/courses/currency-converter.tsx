"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { DISPLAY_CURRENCIES, type DisplayCurrency, type ExchangeRates } from "@/lib/currency/types";

const CURRENCY_LABELS: Record<DisplayCurrency, string> = {
  NGN: "Nigerian Naira",
  USD: "US Dollar",
  GBP: "British Pound",
  EUR: "Euro",
  CAD: "Canadian Dollar",
};

const STORAGE_KEY = "alfawz_preferred_display_currency";

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(
      amount
    );
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/**
 * Shows the course price converted into a currency a diaspora family
 * actually thinks in. This is a reference only — Paystack always charges
 * in the course's real `amountCurrency` (Section 41: the backend never
 * trusts a frontend-computed amount), so the converted figure is clearly
 * labelled "approximate" rather than presented as what gets charged.
 */
export function CurrencyConverter({
  amount,
  baseCurrency,
  rates,
}: {
  amount: number;
  baseCurrency: string;
  rates: ExchangeRates | null;
}) {
  const options = DISPLAY_CURRENCIES.filter(
    (c) => c !== baseCurrency && rates?.rates[c] !== undefined
  );

  const [selected, setSelected] = useState<DisplayCurrency | "">(options[0] ?? "");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as DisplayCurrency | null;
      if (saved && options.includes(saved)) setSelected(saved);
    } catch {
      // Private browsing / blocked storage — just keep the default.
    }
    // Only run once on mount; `options` is derived from props that don't change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!rates || options.length === 0) return null;

  const rate = selected ? rates.rates[selected] : undefined;
  const converted = rate !== undefined ? amount * rate : null;

  function handleChange(value: string) {
    const next = value as DisplayCurrency;
    setSelected(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore — worst case it just doesn't remember next visit.
    }
  }

  return (
    <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Globe size={14} />
        <span>Approximate price in your currency</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <select
          value={selected}
          onChange={(e) => handleChange(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          aria-label="Convert price to"
        >
          {options.map((code) => (
            <option key={code} value={code}>
              {code} — {CURRENCY_LABELS[code]}
            </option>
          ))}
        </select>
        {converted !== null && (
          <span className="font-semibold text-foreground">{formatAmount(converted, selected)}</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        For reference only — you&apos;ll be charged {formatAmount(amount, baseCurrency)} ({baseCurrency})
        via Paystack. Rates update roughly daily and may differ slightly from your bank&apos;s rate.
      </p>
    </div>
  );
}
