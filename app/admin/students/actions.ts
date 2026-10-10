"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminCreateStudentSchema, manualEnrollmentSchema } from "@/lib/validations/schemas";
import { generateTempPassword } from "@/lib/auth/generate-password";
import { sendAdminCreatedAccountEmail, sendEnrollmentConfirmationEmail } from "@/lib/email/send";
import { createNotification } from "@/lib/notifications";

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

export type CreateStudentState = {
  success: boolean;
  formError?: string;
  fieldErrors?: Record<string, string[]>;
  tempPassword?: string;
  studentId?: string;
  email?: string;
};

/**
 * Admin-direct student creation — for students on scholarship or who paid
 * offline, with no self-registration step. A random temp password is
 * generated and returned ONCE in the result (never stored in plaintext,
 * only its bcrypt hash persists) so the admin can hand it to the student;
 * it's also emailed automatically if email sending is configured.
 */
export async function createStudentByAdmin(
  _prev: CreateStudentState,
  formData: FormData
): Promise<CreateStudentState> {
  await requireAdmin();

  const parsed = adminCreateStudentSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    country: formData.get("country") || undefined,
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return {
      success: false,
      fieldErrors: { email: ["An account with this email already exists."] },
    };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const student = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      country: parsed.data.country,
      passwordHash,
      role: "STUDENT",
    },
  });

  await sendAdminCreatedAccountEmail({
    to: student.email,
    name: student.name,
    password: tempPassword,
  }).catch((err) => console.error("Admin-created account email failed:", err));

  revalidatePath("/admin/students");
  return { success: true, tempPassword, studentId: student.id, email: student.email };
}

export type ManualEnrollmentState = { success: boolean; formError?: string };

/**
 * Enrolls a student in a course without Paystack — for scholarships or
 * offline/cash payments. OFFLINE_PAYMENT creates a real Payment row
 * (provider "manual", status SUCCESSFUL) so it correctly counts toward
 * revenue in admin reporting, since money genuinely changed hands.
 * SCHOLARSHIP creates no Payment row at all, so it never inflates revenue —
 * the enrollment's `source` field is the only record of why it's active.
 */
export async function enrollStudentManually(
  studentId: string,
  _prev: ManualEnrollmentState,
  formData: FormData
): Promise<ManualEnrollmentState> {
  const session = await requireAdmin();

  const parsed = manualEnrollmentSchema.safeParse({
    courseId: formData.get("courseId"),
    reason: formData.get("reason"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { success: false, formError: "Please choose a course and a reason." };
  }

  const [student, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId, role: "STUDENT" } }),
    prisma.course.findUnique({ where: { id: parsed.data.courseId } }),
  ]);
  if (!student) return { success: false, formError: "Student not found." };
  if (!course) return { success: false, formError: "Course not found." };

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId: course.id } },
  });
  if (existing?.status === "ACTIVE") {
    return { success: false, formError: "This student is already actively enrolled in this course." };
  }

  await prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.upsert({
      where: { studentId_courseId: { studentId, courseId: course.id } },
      update: {
        status: "ACTIVE",
        source: parsed.data.reason,
        adminNote: parsed.data.note || null,
      },
      create: {
        studentId,
        courseId: course.id,
        status: "ACTIVE",
        source: parsed.data.reason,
        adminNote: parsed.data.note || null,
      },
    });

    if (parsed.data.reason === "OFFLINE_PAYMENT") {
      const reference = `MANUAL-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      await tx.payment.create({
        data: {
          userId: studentId,
          type: "COURSE",
          amount: course.price,
          currency: course.currency,
          reference,
          status: "SUCCESSFUL",
          provider: "manual",
          courseId: course.id,
          paidAt: new Date(),
          metadata: {
            recordedByAdminId: session.user.id,
            reason: "OFFLINE_PAYMENT",
            note: parsed.data.note ?? null,
          },
        },
      });
    }
  });

  await createNotification(
    studentId,
    "Enrollment confirmed",
    parsed.data.reason === "SCHOLARSHIP"
      ? `You've been enrolled in ${course.title} on scholarship. Welcome aboard!`
      : `Your payment for ${course.title} has been confirmed and your enrollment is now active.`
  );

  await sendEnrollmentConfirmationEmail({
    to: student.email,
    name: student.name,
    courseTitle: course.title,
  }).catch((err) => console.error("Manual enrollment email failed:", err));

  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  return { success: true };
}
