"use server";

import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { profileUpdateSchema, passwordChangeSchema } from "@/lib/validations/schemas";

export type ProfileFormState = { success: boolean; error?: string; emailChanged?: boolean };

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "You must be logged in." };

  const parsed = profileUpdateSchema.safeParse({
    name: formData.get("name") || undefined,
    email: formData.get("email") || undefined,
    currentPasswordForEmailChange: formData.get("currentPasswordForEmailChange") || undefined,
    phone: formData.get("phone") || undefined,
    country: formData.get("country") || undefined,
    address: formData.get("address") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: "Please check the fields and try again." };
  }

  const { currentPasswordForEmailChange, ...data } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { success: false, error: "Account not found." };

  const isChangingEmail = !!data.email && data.email !== user.email;

  if (isChangingEmail) {
    // Changing the login email is security-sensitive, so it requires the
    // current password — same principle as Section 14: sensitive fields
    // aren't editable without verification.
    if (!currentPasswordForEmailChange) {
      return { success: false, error: "Enter your current password to change your email." };
    }
    if (!user.passwordHash) {
      return { success: false, error: "Account error. Please contact support." };
    }
    const valid = await bcrypt.compare(currentPasswordForEmailChange, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Current password is incorrect." };
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email! } });
    if (existing && existing.id !== user.id) {
      return { success: false, error: "That email is already in use by another account." };
    }
  } else {
    // Don't touch email at all if it wasn't actually changing — avoids a
    // no-op write and keeps the uniqueness check scoped to real changes.
    delete (data as any).email;
  }

  // Sensitive/administrative fields (role, verification status, etc.) are
  // deliberately not accepted from this form.
  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  // The session's JWT keeps the old email until the next sign-in (it's only
  // refreshed at login, not on every request), so force a fresh login with
  // the new email rather than risk a stale session.
  return { success: true, emailChanged: isChangingEmail };
}

export async function changePassword(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "You must be logged in." };

  const parsed = passwordChangeSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash) return { success: false, error: "Account error. Please contact support." };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { success: false, error: "Current password is incorrect." };

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

  return { success: true };
}
