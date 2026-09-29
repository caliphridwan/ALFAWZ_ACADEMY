"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { sendContactNotificationToAdmin } from "@/lib/email/send";

export type AlumniJoinState = {
  success: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

const joinSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email address").transform((v) => v.trim().toLowerCase()),
  graduationYear: z.coerce
    .number({ invalid_type_error: "Enter your graduation year" })
    .int()
    .min(1990, "Enter a valid year")
    .max(new Date().getFullYear(), "Graduation year cannot be in the future"),
  program: z.string().trim().min(2, "Tell us which program you completed"),
  currentRole: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  story: z.string().trim().min(20, "Please share a little more (at least 20 characters)").max(2000),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree before submitting" }),
  }),
});

/**
 * Anyone can submit, but nothing is public until an admin approves it:
 * rows are created PENDING + unpublished. The email is stored privately for
 * verification and is never selected by any public page.
 */
export async function submitAlumniRegistration(
  _prev: AlumniJoinState,
  formData: FormData
): Promise<AlumniJoinState> {
  // Honeypot: real users never see or fill this field. Bots often do.
  if (formData.get("website")) return { success: true };

  const parsed = joinSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    graduationYear: formData.get("graduationYear"),
    program: formData.get("program"),
    currentRole: formData.get("currentRole") || undefined,
    location: formData.get("location") || undefined,
    story: formData.get("story"),
    consent: formData.get("consent") === "on",
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as any };
  }
  const data = parsed.data;

  // Stop repeat/duplicate submissions from the same email.
  const existing = await prisma.alumnus.findFirst({
    where: { email: data.email, status: { in: ["PENDING", "APPROVED"] } },
  });
  if (existing) {
    return {
      success: false,
      formError:
        existing.status === "PENDING"
          ? "We already have a submission from this email that is awaiting review."
          : "This email is already registered as an alumnus.",
    };
  }

  await prisma.alumnus.create({
    data: {
      name: data.name,
      email: data.email,
      graduationYear: data.graduationYear,
      program: data.program,
      currentRole: data.currentRole || null,
      location: data.location || null,
      story: data.story,
      consentToDisplay: true,
      selfSubmitted: true,
      status: "PENDING",
      published: false,
      featured: false,
    },
  });

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (settings?.contactEmail) {
    await sendContactNotificationToAdmin({
      adminEmail: settings.contactEmail,
      name: data.name,
      email: data.email,
      subject: "New alumni registration awaiting review",
      message: `${data.name} (class of ${data.graduationYear}, ${data.program}) has registered as an alumnus. Review it in the admin dashboard under Alumni.`,
    }).catch((err) => console.error("Alumni notification email failed:", err));
  }

  return { success: true };
}
