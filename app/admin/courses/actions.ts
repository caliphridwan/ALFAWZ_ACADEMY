"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { courseSchema } from "@/lib/validations/schemas";

export type CourseFormState = {
  success: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

function parseCourseForm(formData: FormData) {
  return courseSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    price: formData.get("price"),
    currency: formData.get("currency") || "NGN",
    duration: formData.get("duration"),
    schedule: formData.get("schedule") || undefined,
    level: formData.get("level"),
    ageGroup: formData.get("ageGroup"),
    category: formData.get("category") || undefined,
    instructorId: formData.get("instructorId") || undefined,
    image: formData.get("image") || "",
    active: formData.get("active") === "on",
    enrollmentOpen: formData.get("enrollmentOpen") === "on",
  });
}

export async function createCourse(
  _prev: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  await requireAdmin();

  const parsed = parseCourseForm(formData);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as any };
  }

  const existing = await prisma.course.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { success: false, fieldErrors: { slug: ["A course with this slug already exists."] } };
  }

  const course = await prisma.course.create({
    data: {
      ...parsed.data,
      image: parsed.data.image || null,
      instructorId: parsed.data.instructorId || null,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  redirect(`/admin/courses/${course.id}/edit`);
}

export async function updateCourse(
  courseId: string,
  _prev: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  await requireAdmin();

  const parsed = parseCourseForm(formData);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as any };
  }

  const slugOwner = await prisma.course.findUnique({ where: { slug: parsed.data.slug } });
  if (slugOwner && slugOwner.id !== courseId) {
    return { success: false, fieldErrors: { slug: ["Another course already uses this slug."] } };
  }

  await prisma.course.update({
    where: { id: courseId },
    data: {
      ...parsed.data,
      image: parsed.data.image || null,
      instructorId: parsed.data.instructorId || null,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath(`/courses/${parsed.data.slug}`);
  return { success: true };
}

export async function archiveCourse(courseId: string) {
  await requireAdmin();
  // Soft-delete: courses with existing enrollments/payments must not be hard
  // deleted (would orphan financial records), so we archive instead.
  await prisma.course.update({ where: { id: courseId }, data: { active: false, enrollmentOpen: false } });
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}
