"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireCourseStaff, requireStaff } from "@/lib/auth/course-access";
import { createNotification } from "@/lib/notifications";
import { parseAcademyDateTime } from "@/lib/utils/datetime";

export type TaskFormState = {
  success: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

const taskSchema = z.object({
  title: z.string().trim().min(3, "Give the task a short title").max(150),
  instructions: z.string().trim().max(2000).optional(),
  dueAt: z
    .string()
    .optional()
    .transform((v) => parseAcademyDateTime(v)),
});

function refresh(courseId: string) {
  revalidatePath(`/admin/courses/${courseId}/recitations`);
  revalidatePath(`/teacher/courses/${courseId}/recitations`);
  revalidatePath("/teacher");
  revalidatePath("/dashboard/recitations");
}

/** Sets a recitation exercise for a course and lets its students know. */
export async function createRecitationTask(
  courseId: string,
  _prev: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  await requireCourseStaff(courseId);

  const parsed = taskSchema.safeParse({
    title: formData.get("title") ?? "",
    instructions: formData.get("instructions") || undefined,
    dueAt: formData.get("dueAt") || undefined,
  });
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { title: true } });
  if (!course) return { success: false, formError: "Course not found." };

  await prisma.recitationTask.create({
    data: {
      courseId,
      title: parsed.data.title,
      instructions: parsed.data.instructions || null,
      dueAt: parsed.data.dueAt,
    },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId, status: "ACTIVE" },
    select: { studentId: true },
  });
  for (const { studentId } of enrollments) {
    await createNotification(
      studentId,
      "New recitation task",
      `"${parsed.data.title}" — ${course.title}. Open Recitations to record and send yours.`
    );
  }

  refresh(courseId);
  return { success: true };
}

export async function deleteRecitationTask(taskId: string): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  const task = await prisma.recitationTask.findUnique({ where: { id: taskId }, select: { courseId: true } });
  if (!task) return { ok: false, error: "Task not found." };
  await requireCourseStaff(task.courseId);

  await prisma.recitationTask.delete({ where: { id: taskId } });
  refresh(task.courseId);
  return { ok: true };
}

/** Records the teacher's rating (1–5) and written feedback, and tells the student. */
export async function reviewRecitation(
  submissionId: string,
  rating: number,
  feedback: string,
  // undefined = leave any existing voice feedback as is; null = remove it.
  audio?: { url: string; durationSec: number | null } | null
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Choose a rating from 1 to 5." };
  }
  const text = feedback.trim().slice(0, 1000);

  let audioData: { feedbackAudioUrl: string | null; feedbackAudioSec: number | null } | undefined;
  if (audio === null) audioData = { feedbackAudioUrl: null, feedbackAudioSec: null };
  else if (audio) {
    try {
      const u = new URL(audio.url);
      if (u.protocol !== "https:" || u.hostname !== "res.cloudinary.com" || audio.url.length > 600) throw new Error();
    } catch {
      return { ok: false, error: "The voice note didn't upload correctly. Please try again." };
    }
    const d = audio.durationSec;
    audioData = { feedbackAudioUrl: audio.url, feedbackAudioSec: d && d > 0 && d < 1800 ? Math.round(d) : null };
  }

  const submission = await prisma.recitationSubmission.findUnique({
    where: { id: submissionId },
    select: { studentId: true, task: { select: { title: true, courseId: true } } },
  });
  if (!submission) return { ok: false, error: "Recording not found." };
  const session = await requireCourseStaff(submission.task.courseId);

  await prisma.recitationSubmission.update({
    where: { id: submissionId },
    data: { rating, feedback: text || null, ...audioData, reviewedAt: new Date(), reviewedById: session.user.id },
  });

  await createNotification(
    submission.studentId,
    "Feedback on your recitation",
    `Your teacher reviewed "${submission.task.title}" (${rating}/5). Open Recitations to read the feedback.`
  );

  refresh(submission.task.courseId);
  return { ok: true };
}
