import "server-only";

/**
 * Section 15/41/42: all Paystack calls happen on the server using the
 * secret key. This file must never be imported from a "use client" component
 * — the `server-only` import above will throw a build error if that happens.
 */

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set. Add it to your environment variables — never hardcode it."
    );
  }
  return key;
}

type InitializeParams = {
  email: string;
  amountKobo: number; // Paystack expects the smallest currency unit
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export async function initializeTransaction(
  params: InitializeParams
): Promise<PaystackInitializeResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata ?? {},
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Paystack initialize failed (${res.status}): ${errBody}`);
  }

  return res.json();
}

export type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number; // kobo
    currency: string;
    paid_at: string | null;
    metadata: Record<string, unknown>;
    customer: { email: string };
  };
};

/**
 * Verifies a transaction directly with Paystack's servers. This is the ONLY
 * source of truth for whether a payment succeeded — the frontend's redirect
 * or query params are never trusted on their own (Section 15, 41).
 */
export async function verifyTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${getSecretKey()}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Paystack verify failed (${res.status}): ${errBody}`);
  }

  return res.json();
}

export function nairaToKobo(amountNaira: number): number {
  return Math.round(amountNaira * 100);
}

export function koboToNaira(amountKobo: number): number {
  return amountKobo / 100;
}

/**
 * Generates a unique, collision-resistant payment reference.
 * Prefix makes it easy to distinguish course vs sponsorship payments in the
 * Paystack dashboard during support/reconciliation.
 */
export function generateReference(prefix: "CRS" | "SPN"): string {
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return `AFZ-${prefix}-${Date.now()}-${random}`;
}
