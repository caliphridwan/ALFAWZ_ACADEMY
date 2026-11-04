"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { requireCourseStaff, requireStaff } from "@/lib/auth/course-access";
import { classSessionSchema } from "@/lib/validations/schemas";
import { createNotification } from "@/lib/notifications";

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
  revalidatePath(`/teacher/courses/${courseId}`);
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

/**
 * Saves (or clears, when empty) the recording link for a class. The first
 * time a link is added, the class's students are told it's available.
 */
export async function setSessionRecording(sessionId: string, url: string): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();

  const clean = url.trim();
  if (clean && !/^https:\/\/\S+$/.test(clean)) {
    return { ok: false, error: "Enter a full link starting with https://" };
  }

  const before = await prisma.classSession.findUnique({
    where: { id: sessionId },
    select: { recordingUrl: true, topic: true, startsAt: true, course: { select: { id: true, title: true } } },
  });
  if (!before) return { ok: false, error: "Class not found." };
  await requireCourseStaff(before.course.id);

  await prisma.classSession.update({ where: { id: sessionId }, data: { recordingUrl: clean || null } });

  if (clean && !before.recordingUrl) {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: before.course.id, status: { in: ["ACTIVE", "COMPLETED"] } },
      select: { studentId: true },
    });
    for (const { studentId } of enrollments) {
      await createNotification(
        studentId,
        "Class recording available",
        `The recording of "${before.course.title}"${before.topic ? ` (${before.topic})` : ""} is ready. Open Schedule to watch it.`
      );
    }
  }

  revalidateSessionPages(before.course.id);
  return { ok: true };
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
  await requireStaff();

  const sessionId = String(formData.get("sessionId") ?? "");
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    select: { id: true, courseId: true },
  });
  if (!session) return { success: false, formError: "Class not found." };
  await requireCourseStaff(session.courseId);

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
  revalidatePath(`/teacher/courses/${session.courseId}/sessions/${sessionId}`);
  return { success: true, saved };
}
