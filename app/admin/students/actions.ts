"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function setStudentActive(studentId: string, isActive: boolean) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: studentId, role: "STUDENT" },
    data: { isActive },
  });

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
}

/**
 * Records an exam result for one enrollment. examResultSeen is reset to
 * false so the student's dashboard pop-up shows the (new) result once —
 * this also means correcting a mistaken grade re-shows the pop-up with the
 * corrected outcome, which is the right behavior.
 * Passing marks the enrollment COMPLETED; failing keeps/returns it to
 * ACTIVE, since "repeated the class" means they continue in the course.
 */
export async function setExamResult(enrollmentId: string, result: "PASSED" | "FAILED") {
  await requireAdmin();

  const enrollment = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      examResult: result,
      examResultSeen: false,
      status: result === "PASSED" ? "COMPLETED" : "ACTIVE",
    },
    select: { studentId: true },
  });

  revalidatePath(`/admin/students/${enrollment.studentId}`);
  revalidatePath("/dashboard");
}
