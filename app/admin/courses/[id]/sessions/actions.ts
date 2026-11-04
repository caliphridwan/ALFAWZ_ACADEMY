"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { classSessionSchema } from "@/lib/validations/schemas";

export type SessionFormState = {
  success: boolean;
  created?: number;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

export type AttendanceFormState = {
  success: boolean;
  saved?: number;
  formError?: string;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function revalidateSessionPages(courseId: string) {
  revalidatePath(`/admin/courses/${courseId}/sessions`);
  revalidatePath("/dashboard/schedule");
  revalidatePath("/dashboard/courses");
}

/**
 * Creates one class, or the same class every week for `repeatWeeks` weeks
 * (West Africa Time has no daylight saving, so +7 days is always the same
 * wall-clock time).
 */
export async function createClassSessions(
  _prev: SessionFormState,
  formData: FormData
): Promise<SessionFormState> {
  await requireAdmin();

  const courseId = String(formData.get("courseId") ?? "");
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) return { success: false, formError: "Course not found." };

  const parsed = classSessionSchema.safeParse({
    startsAt: formData.get("startsAt") ?? "",
    durationMinutes: formData.get("durationMinutes") ?? "",
    topic: formData.get("topic") || undefined,
    zoomLink: formData.get("zoomLink") || "",
    repeatWeeks: formData.get("repeatWeeks") || 1,
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { startsAt, durationMinutes, topic, zoomLink, repeatWeeks } = parsed.data;

  await prisma.classSession.createMany({
    data: Array.from({ length: repeatWeeks }, (_, i) => ({
      courseId,
      startsAt: new Date(startsAt.getTime() + i * WEEK_MS),
      durationMinutes,
      topic: topic || null,
      zoomLink: zoomLink || null,
    })),
  });

  revalidateSessionPages(courseId);
  return { success: true, created: repeatWeeks };
}

export async function setSessionCancelled(sessionId: string, cancelled: boolean) {
  await requireAdmin();

  const session = await prisma.classSession.update({
    where: { id: sessionId },
    data: { cancelled },
    select: { courseId: true },
  });

  revalidateSessionPages(session.courseId);
}

export async function deleteClassSession(sessionId: string) {
  await requireAdmin();

  const session = await prisma.classSession.delete({
    where: { id: sessionId },
    select: { courseId: true },
  });

  revalidateSessionPages(session.courseId);
}

const ATTENDANCE_VALUES = ["PRESENT", "ABSENT", "EXCUSED"] as const;
type AttendanceValue = (typeof ATTENDANCE_VALUES)[number];

/**
 * Form fields are named `status_<studentId>`. An empty value means "not
 * marked" and is skipped (or cleared if a mark already existed).
 */
export async function saveAttendance(
  _prev: AttendanceFormState,
  formData: FormData
): Promise<AttendanceFormState> {
  await requireAdmin();

  const sessionId = String(formData.get("sessionId") ?? "");
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    select: { id: true, courseId: true },
  });
  if (!session) return { success: false, formError: "Class not found." };

  // Only students actually enrolled in this course can be marked.
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: session.courseId, status: { in: ["ACTIVE", "COMPLETED"] } },
    select: { studentId: true },
  });

  let saved = 0;
  for (const { studentId } of enrollments) {
    const raw = String(formData.get(`status_${studentId}`) ?? "");

    if (raw === "") {
      await prisma.attendance.deleteMany({ where: { sessionId, studentId } });
      continue;
    }
    if (!ATTENDANCE_VALUES.includes(raw as AttendanceValue)) continue;

    await prisma.attendance.upsert({
      where: { sessionId_studentId: { sessionId, studentId } },
      update: { status: raw as AttendanceValue, markedAt: new Date() },
      create: { sessionId, studentId, status: raw as AttendanceValue },
    });
    saved += 1;
  }

  revalidateSessionPages(session.courseId);
  revalidatePath(`/admin/courses/${session.courseId}/sessions/${sessionId}`);
  return { success: true, saved };
}
