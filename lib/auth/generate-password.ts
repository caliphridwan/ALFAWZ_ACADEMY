import "server-only";
import crypto from "crypto";

/**
 * Cryptographically random temporary password for admin-created accounts.
 * Shown to the admin exactly once at creation time (never stored or
 * recoverable in plaintext — only its bcrypt hash persists), so they can
 * hand it to the student directly. The student should change it on first
 * login via their own Profile page.
 */
export function generateTempPassword(): string {
  // 12 chars from an unambiguous alphabet (no 0/O, 1/l/I confusion).
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(12);
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += alphabet[bytes[i] % alphabet.length];
  }
  return password;
}
