"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validations/schemas";
import { sendAlumniApprovedEmail } from "@/lib/email/send";

const alumnusSchema = z.object({
  name: z.string().min(2),
  photo: imagePathSchema,
  graduationYear: z.coerce.number().int().min(1990).max(2100),
  program: z.string().min(2),
  currentRole: z.string().optional(),
  location: z.string().optional(),
  story: z.string().min(10),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

export type AlumnusFormState = { success: boolean; formError?: string };

export async function upsertAlumnus(
  alumnusId: string | null,
  _prev: AlumnusFormState,
  formData: FormData
): Promise<AlumnusFormState> {
  await requireAdmin();

  const parsed = alumnusSchema.safeParse({
    name: formData.get("name"),
    photo: formData.get("photo") || "",
    graduationYear: formData.get("graduationYear"),
    program: formData.get("program"),
    currentRole: formData.get("currentRole") || undefined,
    location: formData.get("location") || undefined,
    story: formData.get("story"),
    linkedinUrl: formData.get("linkedinUrl") || "",
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
  });

  if (!parsed.success) {
    return { success: false, formError: "Please check the form for errors." };
  }

  const data = {
    ...parsed.data,
    photo: parsed.data.photo || null,
    linkedinUrl: parsed.data.linkedinUrl || null,
  };

  if (alumnusId) {
    // Publishing from the edit form counts as approval, so status and
    // visibility can never disagree.
    await prisma.alumnus.update({
      where: { id: alumnusId },
      data: { ...data, ...(data.published ? { status: "APPROVED" as const } : {}) },
    });
  } else {
    await prisma.alumnus.create({ data });
  }

  revalidatePath("/admin/alumni");
  revalidatePath("/alumni");
  return { success: true };
}

export async function deleteAlumnus(alumnusId: string) {
  await requireAdmin();
  await prisma.alumnus.delete({ where: { id: alumnusId } });
  revalidatePath("/admin/alumni");
  revalidatePath("/alumni");
}

export async function toggleAlumnusPublished(alumnusId: string, published: boolean) {
  await requireAdmin();
  await prisma.alumnus.update({ where: { id: alumnusId }, data: { published } });
  revalidatePath("/admin/alumni");
  revalidatePath("/alumni");
}

export async function toggleAlumnusFeatured(alumnusId: string, featured: boolean) {
  await requireAdmin();
  await prisma.alumnus.update({ where: { id: alumnusId }, data: { featured } });
  revalidatePath("/admin/alumni");
  revalidatePath("/alumni");
}

/**
 * Review workflow for self-registered alumni. Approving publishes the
 * profile; rejecting keeps it hidden (the row is kept so the same email
 * cannot spam-resubmit unnoticed, and admin can reverse the decision).
 */
export async function approveAlumnus(alumnusId: string) {
  await requireAdmin();
  const alumnus = await prisma.alumnus.update({
    where: { id: alumnusId },
    data: { status: "APPROVED", published: true },
  });
  revalidatePath("/admin/alumni");
  revalidatePath("/alumni");

  if (alumnus.email) {
    await sendAlumniApprovedEmail({ to: alumnus.email, name: alumnus.name }).catch((err) =>
      console.error("Alumni approval email failed:", err)
    );
  }
}

export async function rejectAlumnus(alumnusId: string) {
  await requireAdmin();
  await prisma.alumnus.update({
    where: { id: alumnusId },
    data: { status: "REJECTED", published: false, featured: false },
  });
  revalidatePath("/admin/alumni");
  revalidatePath("/alumni");
}
