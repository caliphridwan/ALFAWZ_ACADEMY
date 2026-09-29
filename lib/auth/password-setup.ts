import "server-only";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Creates a one-time token for setting/resetting a password and returns the
 * raw (unhashed) value to put in an email link. Only the hash is stored, so
 * the raw token is never recoverable from the database — same mechanism
 * whether this is a genuine password reset or a first-time account setup
 * (e.g. a sponsor account created without a password at checkout).
 */
export async function createPasswordSetupToken(email: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      expires: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return rawToken;
}

export function buildPasswordSetupUrl(email: string, rawToken: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
}
