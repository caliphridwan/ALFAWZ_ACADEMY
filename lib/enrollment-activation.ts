import "server-only";
import { prisma } from "@/lib/db/prisma";
import { createNotification } from "@/lib/notifications";
import { sendEnrollmentConfirmationEmail } from "@/lib/email/send";

/**
 * Makes a student's enrollment ACTIVE on an admin's say-so (an approved bank
 * transfer or scholarship). Mirrors what "Enroll student manually" does:
 * OFFLINE_PAYMENT also records a real, successful Payment (so it counts as
 * revenue); SCHOLARSHIP records none.
 */
export async function activateEnrollment(params: {
  studentId: string;
  courseId: string;
  reason: "SCHOLARSHIP" | "OFFLINE_PAYMENT";
  note?: string | null;
  adminId: string;
  /** Amount actually received, if it differs from the course price. */
  amount?: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const [student, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: params.studentId } }),
    prisma.course.findUnique({ where: { id: params.courseId } }),
  ]);
  if (!student || student.role !== "STUDENT") return { ok: false, error: "Student not found." };
  if (!course) return { ok: false, error: "Course not found." };

  await prisma.$transaction(async (tx) => {
    await tx.enrollment.upsert({
      where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
      update: { status: "ACTIVE", source: params.reason, adminNote: params.note || null },
      create: {
        studentId: student.id,
        courseId: course.id,
        status: "ACTIVE",
        source: params.reason,
        adminNote: params.note || null,
      },
    });

    if (params.reason === "OFFLINE_PAYMENT") {
      await tx.payment.create({
        data: {
          userId: student.id,
          type: "COURSE",
          amount: params.amount ?? course.price,
          currency: course.currency,
          reference: `MANUAL-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          status: "SUCCESSFUL",
          provider: "manual",
          courseId: course.id,
          paidAt: new Date(),
          metadata: {
            recordedByAdminId: params.adminId,
            reason: "OFFLINE_PAYMENT",
            note: params.note ?? null,
          },
        },
      });
    }
  });

  await createNotification(
    student.id,
    "Enrollment confirmed",
    params.reason === "SCHOLARSHIP"
      ? `You've been enrolled in ${course.title} on scholarship. Welcome aboard!`
      : `Your payment for ${course.title} has been confirmed and your enrollment is now active.`
  );
  await sendEnrollmentConfirmationEmail({
    to: student.email,
    name: student.name,
    courseTitle: course.title,
  }).catch((err) => console.error("Enrollment activation email failed:", err));

  return { ok: true };
}
