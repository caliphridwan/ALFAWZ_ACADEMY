"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Landmark } from "lucide-react";
import type { BankTransferInfo } from "@/lib/bank-details";

/**
 * Fallback for people who'd rather pay by direct transfer, or when Paystack
 * isn't working. Payment is confirmed manually by an admin, so the box
 * tells the payer exactly how to send proof.
 */
export function BankTransferDetails({
  info,
  purpose,
  compact = false,
  claimHref,
}: {
  info: BankTransferInfo | null;
  /** What the transfer is for, e.g. the course title or "Student sponsorship". */
  purpose?: string;
  compact?: boolean;
  /** When set, shows a button to submit proof of payment (students only). */
  claimHref?: string;
}) {
  const [copied, setCopied] = useState(false);
  if (!info) return null;

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(info!.accountNumber.replace(/\s|-/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the number is still visible to copy by hand.
    }
  }

  const whatsappDigits = info.whatsappNumber?.replace(/\D/g, "");
  const proofMessage = encodeURIComponent(
    `Assalamu Alaikum, I have made a bank transfer${purpose ? ` for ${purpose}` : ""}. Please find my proof of payment attached.`
  );

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
      <div className="flex items-center gap-2 font-semibold mb-1">
        <Landmark size={16} className="text-brand" />
        Prefer to pay by bank transfer?
      </div>
      {!compact && (
        <p className="text-xs text-muted-foreground mb-3">
          Use this if you&apos;d rather transfer directly, or if online payment
          isn&apos;t working for you.
        </p>
      )}

      <dl className="space-y-1.5">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Bank</dt>
          <dd className="font-medium text-right">{info.bankName}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Account name</dt>
          <dd className="font-medium text-right">{info.accountName}</dd>
        </div>
        <div className="flex justify-between items-center gap-3">
          <dt className="text-muted-foreground">Account number</dt>
          <dd className="font-mono font-semibold flex items-center gap-2">
            {info.accountNumber}
            <button
              type="button"
              onClick={copyNumber}
              className="rounded border border-border p-1 hover:bg-background"
              aria-label="Copy account number"
            >
              {copied ? <Check size={14} className="text-brand" /> : <Copy size={14} />}
            </button>
          </dd>
        </div>
      </dl>

      {info.note && <p className="mt-3 text-xs text-muted-foreground">{info.note}</p>}

      <p className="mt-3 text-xs text-muted-foreground">
        After transferring, send your proof of payment
        {whatsappDigits && (
          <>
            {" "}on{" "}
            <a
              href={`https://wa.me/${whatsappDigits}?text=${proofMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline"
            >
              WhatsApp
            </a>
          </>
        )}
        {whatsappDigits && info.contactEmail && " or "}
        {info.contactEmail && (
          <>
            {!whatsappDigits && " to "}
            <a href={`mailto:${info.contactEmail}`} className="text-brand underline">
              {info.contactEmail}
            </a>
          </>
        )}
        {!whatsappDigits && !info.contactEmail && " to the academy"}
        . Your enrollment or sponsorship is confirmed once we verify the payment.
      </p>

      {claimHref && (
        <Link
          href={claimHref}
          className="mt-3 inline-flex h-9 items-center rounded-md bg-brand px-4 text-sm font-medium text-brand-foreground hover:opacity-90"
        >
          I&apos;ve paid — submit my receipt
        </Link>
      )}
    </div>
  );
}
