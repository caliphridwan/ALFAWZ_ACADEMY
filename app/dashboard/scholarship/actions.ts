"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { notifyAdmins } from "@/lib/notify-admins";

export type ScholarshipFormState = {
  success: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

const schema = z.object({
  courseId: z.string().min(1, "Choose a course"),
  reason: z.string().trim().min(20, "Please tell us a little more (at least a couple of sentences)").max(2000),
});

export async function applyForScholarship(
  _prev: ScholarshipFormState,
  formData: FormData
): Promise<ScholarshipFormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") throw new Error("Unauthorized.");
  const studentId = session.user.id;

  const parsed = schema.safeParse({
    courseId: formData.get("courseId") ?? "",
    reason: formData.get("reason") ?? "",
  });
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const [course, enrollment, pending, student] = await Promise.all([
    prisma.course.findUnique({ where: { id: parsed.data.courseId }, select: { id: true, title: true, active: true } }),
    prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId: parsed.data.courseId } },
      select: { status: true },
    }),
    prisma.scholarshipApplication.findFirst({
      where: { studentId, courseId: parsed.data.courseId, status: "PENDING" },
    }),
    prisma.user.findUnique({ where: { id: studentId }, select: { name: true } }),
  ]);
  if (!course || !course.active) return { success: false, formError: "That course isn't available." };
  if (enrollment?.status === "ACTIVE") return { success: false, formError: "You're already enrolled in this course." };
  if (pending) return { success: false, formError: "You already have an application for this course under review." };

  await prisma.scholarshipApplication.create({
    data: { studentId, courseId: course.id, reason: parsed.data.reason },
  });

  await notifyAdmins(
    "Scholarship application",
    `${student?.name ?? "A student"} applied for a scholarship for "${course.title}". Open Scholarships to review.`
  );

  revalidatePath("/dashboard/scholarship");
  revalidatePath("/admin/scholarships");
  return { success: true };
}
