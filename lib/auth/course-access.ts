import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/** Any signed-in admin or teacher (used before a record has been looked up). */
export async function requireStaff() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session?.user || (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "TEACHER")) {
    throw new Error("Unauthorized.");
  }
  return session;
}

/**
 * Admins may act on any course; a teacher only on a course they are the
 * instructor of. Every teacher-facing mutation calls this with the course
 * the record belongs to, so a forged request can't touch someone else's class.
 */
export async function requireCourseStaff(courseId: string) {
  const session = await requireStaff();
  const role = session.user.role;
  if (role === "TEACHER") {
    const owned = await prisma.course.findFirst({
      where: { id: courseId, instructor: { is: { userId: session.user.id } } },
      select: { id: true },
    });
    if (!owned) throw new Error("Unauthorized: this is not your course.");
  }
  return session;
}
