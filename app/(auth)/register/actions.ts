"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validations/schemas";
import { sendWelcomeEmail } from "@/lib/email/send";

export type RegisterFormState = {
  success: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

/**
 * Section 10 & 11: full registration flow with server-enforced guardian
 * requirement for minors. The client may hide/show guardian fields for UX,
 * but this action re-validates independently — the frontend's opinion of the
 * student's age is never trusted on its own.
 */
export async function registerStudent(
  _prev: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const raw = Object.fromEntries(formData.entries());

  const guardianProvided =
    raw["guardian.name"] || raw["guardian.email"] || raw["guardian.phone"];

  const parsed = registerSchema.safeParse({
    ...raw,
    guardian: guardianProvided
      ? {
          name: raw["guardian.name"],
          email: raw["guardian.email"],
          phone: raw["guardian.phone"],
          relationship: raw["guardian.relationship"],
        }
      : undefined,
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as any };
  }

  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return {
      success: false,
      fieldErrors: { email: ["An account with this email already exists"] },
    };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.fullName,
      email: data.email,
      passwordHash,
      role: "STUDENT",
      phone: data.phone,
      country: data.country,
      address: data.address,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      ...(data.guardian
        ? {
            guardian: {
              create: {
                name: data.guardian.name,
                email: data.guardian.email,
                phone: data.guardian.phone,
                relationship: data.guardian.relationship,
              },
            },
          }
        : {}),
    },
  });

  await sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) => {
    // Registration should not fail just because the email provider hiccuped.
    console.error("Welcome email failed to send:", err);
  });

  return { success: true };
}
