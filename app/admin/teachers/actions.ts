"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validations/schemas";

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
