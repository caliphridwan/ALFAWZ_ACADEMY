"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { createNotification } from "@/lib/notifications";
import { notifyAdmins } from "@/lib/notify-admins";

/**
 * Saves the student's recording (already uploaded to Cloudinary by their
 * browser) against a task. Sending again replaces the earlier recording and
 * clears the old review, so the teacher knows to listen again.
 */
export async function submitRecitation(
  taskId: string,
  audioUrl: string,
  durationSec: number | null,
  note: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") throw new Error("Unauthorized.");
  const studentId = session.user.id;

  let url: URL;
  try {
    url = new URL(audioUrl);
  } catch {
    return { ok: false, error: "The recording didn't upload correctly. Please try again." };
  }
  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" || audioUrl.length > 600) {
    return { ok: false, error: "The recording didn't upload correctly. Please try again." };
  }

  const task = await prisma.recitationTask.findUnique({
    where: { id: taskId },
    select: {
      title: true,
      courseId: true,
      course: { select: { title: true, instructor: { select: { userId: true } } } },
    },
  });
  if (!task) return { ok: false, error: "Task not found." };

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId: task.courseId } },
    select: { status: true },
  });
  if (!enrollment || (enrollment.status !== "ACTIVE" && enrollment.status !== "COMPLETED")) {
    return { ok: false, error: "You're not enrolled in this course." };
  }

  const duration = durationSec && durationSec > 0 && durationSec < 3600 ? Math.round(durationSec) : null;
  const cleanNote = note.trim().slice(0, 500) || null;

  await prisma.recitationSubmission.upsert({
    where: { taskId_studentId: { taskId, studentId } },
    create: { taskId, studentId, audioUrl, durationSec: duration, note: cleanNote },
    update: {
      audioUrl,
      durationSec: duration,
      note: cleanNote,
      submittedAt: new Date(),
      rating: null,
      feedback: null,
      reviewedAt: null,
      reviewedById: null,
    },
  });

  const student = await prisma.user.findUnique({ where: { id: studentId }, select: { name: true } });
  const message = `${student?.name ?? "A student"} sent a recitation for "${task.title}" (${task.course.title}).`;
  const teacherUserId = task.course.instructor?.userId;
  if (teacherUserId) await createNotification(teacherUserId, "New recitation to review", message, "/teacher");
  else await notifyAdmins("New recitation to review", message);

  revalidatePath("/dashboard/recitations");
  revalidatePath(`/teacher/courses/${task.courseId}/recitations`);
  revalidatePath(`/admin/courses/${task.courseId}/recitations`);
  revalidatePath("/teacher");
  return { ok: true };
}
