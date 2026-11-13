import "server-only";
import { prisma } from "@/lib/db/prisma";

/** Recordings still waiting for feedback, per course (all courses when no ids given). */
export async function pendingRecitationsByCourse(courseIds?: string[]): Promise<Map<string, number>> {
  if (courseIds && courseIds.length === 0) return new Map();
  const tasks = await prisma.recitationTask.findMany({
    where: courseIds ? { courseId: { in: courseIds } } : undefined,
    select: { courseId: true, _count: { select: { submissions: { where: { reviewedAt: null } } } } },
  });
  const map = new Map<string, number>();
  for (const t of tasks) map.set(t.courseId, (map.get(t.courseId) ?? 0) + t._count.submissions);
  return map;
}
