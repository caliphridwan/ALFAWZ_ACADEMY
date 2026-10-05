"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

const materialSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  description: z.string().trim().optional(),
  fileUrl: z
    .string()
    .trim()
    .url("Enter a valid file URL")
    .refine((v) => v.startsWith("https://"), "File URL must use https://"),
});

export type MaterialFormState = {
  success: boolean;
  fieldErrors?: Record<string, string[]>;
};

export async function addMaterial(
  courseId: string,
  _prev: MaterialFormState,
  formData: FormData
): Promise<MaterialFormState> {
  await requireAdmin();

  const parsed = materialSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    fileUrl: formData.get("fileUrl"),
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.courseMaterial.create({
    data: { courseId, ...parsed.data },
  });

  revalidatePath(`/admin/courses/${courseId}/materials`);
  revalidatePath("/dashboard/materials");
  return { success: true };
}

export async function deleteMaterial(materialId: string, courseId: string) {
  await requireAdmin();

  await prisma.courseMaterial.delete({ where: { id: materialId } });

  revalidatePath(`/admin/courses/${courseId}/materials`);
  revalidatePath("/dashboard/materials");
}
