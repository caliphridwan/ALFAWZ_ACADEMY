import "server-only";
import crypto from "crypto";

/**
 * Paystack signs every webhook payload with HMAC-SHA512 using your secret key.
 * Requests with a missing/invalid signature must be rejected outright —
 * this is what stops an attacker from forging a "successful payment" event.
 */
export function isValidPaystackSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error("PAYSTACK_SECRET_KEY is not set.");
  }

  const expectedHash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");

  // Constant-time comparison to avoid timing attacks.
  const expectedBuf = Buffer.from(expectedHash, "utf8");
  const givenBuf = Buffer.from(signatureHeader, "utf8");
  if (expectedBuf.length !== givenBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, givenBuf);
}
