"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createNotification } from "@/lib/notifications";

/** A gentle check-in sent to a student who has missed their recent classes. */
export async function nudgeStudent(studentId: string, courseId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const [student, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId }, select: { id: true } }),
    prisma.course.findUnique({ where: { id: courseId }, select: { title: true } }),
  ]);
  if (!student || !course) return { ok: false, error: "Student or course not found." };

  await createNotification(
    studentId,
    "We missed you in class",
    `We noticed you've missed your recent classes in "${course.title}". Is everything alright? Open Schedule to catch up with the recordings, or contact us if you need any help.`
  );
  return { ok: true };
}
