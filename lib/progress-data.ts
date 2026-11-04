import "server-only";
import { prisma } from "@/lib/db/prisma";
import { computeProgress, type AttendanceValue, type CourseProgress } from "@/lib/progress";

/**
 * Progress for several of one student's enrollments in two queries total
 * (not one per course). Keyed by enrollment id.
 */
export async function getProgressForEnrollments(
  studentId: string,
  enrollments: { id: string; courseId: string; enrolledAt: Date }[]
): Promise<Map<string, CourseProgress>> {
  const result = new Map<string, CourseProgress>();
  if (enrollments.length === 0) return result;

  const courseIds = [...new Set(enrollments.map((e) => e.courseId))];

  const [sessions, attendance] = await Promise.all([
    prisma.classSession.findMany({
      where: { courseId: { in: courseIds } },
      select: { id: true, courseId: true, startsAt: true, durationMinutes: true, cancelled: true },
    }),
    prisma.attendance.findMany({
      where: { studentId, session: { courseId: { in: courseIds } } },
      select: { sessionId: true, status: true },
    }),
  ]);

  const attendanceMap = new Map<string, AttendanceValue>(
    attendance.map((a) => [a.sessionId, a.status as AttendanceValue])
  );

  for (const e of enrollments) {
    result.set(
      e.id,
      computeProgress(
        sessions.filter((s) => s.courseId === e.courseId),
        attendanceMap,
        e.enrolledAt
      )
    );
  }

  return result;
}
