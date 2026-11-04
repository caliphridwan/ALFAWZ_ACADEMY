"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validations/schemas";
import { createPasswordSetupToken, buildPasswordSetupUrl } from "@/lib/auth/password-setup";
import { sendPasswordResetEmail } from "@/lib/email/send";

const teacherSchema = z.object({
  name: z.string().min(2),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  biography: z.string().optional(),
  photo: imagePathSchema,
  active: z.boolean().default(true),
});

export type TeacherFormState = { success: boolean; formError?: string };

export async function upsertTeacher(
  teacherId: string | null,
  _prev: TeacherFormState,
  formData: FormData
): Promise<TeacherFormState> {
  await requireAdmin();

  const parsed = teacherSchema.safeParse({
    name: formData.get("name"),
    qualification: formData.get("qualification") || undefined,
    specialization: formData.get("specialization") || undefined,
    biography: formData.get("biography") || undefined,
    photo: formData.get("photo") || "",
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { success: false, formError: "Please check the form for errors." };
  }

  const data = { ...parsed.data, photo: parsed.data.photo || null };

  if (teacherId) {
    await prisma.teacher.update({ where: { id: teacherId }, data });
  } else {
    await prisma.teacher.create({ data });
  }

  revalidatePath("/admin/teachers");
  revalidatePath("/teachers");
  return { success: true };
}

export async function deleteTeacher(teacherId: string) {
  await requireAdmin();
  // Courses referencing this teacher keep instructorId as null (see schema's
  // optional relation) rather than being deleted.
  await prisma.teacher.update({ where: { id: teacherId }, data: { active: false } });
  revalidatePath("/admin/teachers");
  revalidatePath("/teachers");
}

export type TeacherLoginState = { success: boolean; error?: string; email?: string };

/**
 * Gives a teacher a sign-in account (role TEACHER) and emails them a link to
 * choose their password. They then see only their own courses at /teacher.
 */
export async function createTeacherLogin(
  teacherId: string,
  _prev: TeacherLoginState,
  formData: FormData
): Promise<TeacherLoginState> {
  await requireAdmin();

  const parsed = z.string().email("Enter a valid email address").safeParse(
    String(formData.get("email") ?? "").trim().toLowerCase()
  );
  if (!parsed.success) return { success: false, error: "Enter a valid email address." };
  const email = parsed.data;

  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) return { success: false, error: "Teacher not found." };
  if (teacher.userId) return { success: false, error: "This teacher already has a login." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { success: false, error: "An account with this email already exists." };

  const user = await prisma.user.create({ data: { name: teacher.name, email, role: "TEACHER" } });
  await prisma.teacher.update({ where: { id: teacherId }, data: { userId: user.id } });

  try {
    const rawToken = await createPasswordSetupToken(email);
    await sendPasswordResetEmail({ to: email, resetUrl: buildPasswordSetupUrl(email, rawToken) });
  } catch (err) {
    console.error("Teacher invite email failed:", err);
    revalidatePath(`/admin/teachers/${teacherId}/edit`);
    return {
      success: true,
      email,
      error: "Account created, but the email could not be sent. Ask them to use “Forgot password” on the login page.",
    };
  }

  revalidatePath(`/admin/teachers/${teacherId}/edit`);
  return { success: true, email };
}
