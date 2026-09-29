"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { sendPasswordResetEmail } from "@/lib/email/send";

const emailSchema = z.string().email().transform((v) => v.trim().toLowerCase());
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export type SimpleFormState = { success: boolean; error?: string };

/**
 * Deliberately does not reveal whether the email exists (avoids leaking
 * which emails are registered students/sponsors) — always returns success
 * from the caller's point of view.
 */
export async function requestPasswordReset(
  _prev: SimpleFormState,
  formData: FormData
): Promise<SimpleFormState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { success: false, error: "Enter a valid email address." };

  const user = await prisma.user.findUnique({ where: { email: parsed.data } });

  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: hashedToken,
        expires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await sendPasswordResetEmail({
      to: user.email,
      resetUrl: `${appUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`,
    }).catch((err) => console.error("Password reset email failed:", err));
  }

  return { success: true };
}

const resetSchema = z
  .object({
    email: z.string().email(),
    token: z.string().min(10),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function resetPassword(
  _prev: SimpleFormState,
  formData: FormData
): Promise<SimpleFormState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid request." };
  }
  const { email, token, password } = parsed.data;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token: hashedToken } },
  });

  if (!record || record.expires < new Date()) {
    return { success: false, error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { passwordHash } }),
    prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: hashedToken } },
    }),
  ]);

  return { success: true };
}
