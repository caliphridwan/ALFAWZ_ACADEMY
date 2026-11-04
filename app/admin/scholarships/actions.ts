"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { activateEnrollment } from "@/lib/enrollment-activation";
import { createNotification } from "@/lib/notifications";

type Result = { ok: boolean; error?: string };

function refresh() {
  revalidatePath("/admin/scholarships");
  revalidatePath("/admin");
}

export async function approveScholarship(applicationId: string): Promise<Result> {
  const session = await requireAdmin();

  const claimed = await prisma.scholarshipApplication.updateMany({
    where: { id: applicationId, status: "PENDING" },
    data: { status: "APPROVED", reviewedAt: new Date(), reviewedById: session.user.id },
  });
  if (claimed.count === 0) return { ok: false, error: "This application was already reviewed." };

  const application = await prisma.scholarshipApplication.findUnique({ where: { id: applicationId } });
  if (!application) return { ok: false, error: "Application not found." };

  const result = await activateEnrollment({
    studentId: application.studentId,
    courseId: application.courseId,
    reason: "SCHOLARSHIP",
    note: "Approved scholarship application",
    adminId: session.user.id,
  });

  if (!result.ok) {
    await prisma.scholarshipApplication.update({
      where: { id: applicationId },
      data: { status: "PENDING", reviewedAt: null, reviewedById: null },
    });
    return { ok: false, error: result.error };
  }

  refresh();
  return { ok: true };
}

export async function rejectScholarship(applicationId: string, reason: string): Promise<Result> {
  const session = await requireAdmin();
  const note = reason.trim().slice(0, 500);

  const claimed = await prisma.scholarshipApplication.updateMany({
    where: { id: applicationId, status: "PENDING" },
    data: { status: "REJECTED", reviewNote: note || null, reviewedAt: new Date(), reviewedById: session.user.id },
  });
  if (claimed.count === 0) return { ok: false, error: "This application was already reviewed." };

  const application = await prisma.scholarshipApplication.findUnique({
    where: { id: applicationId },
    select: { studentId: true, course: { select: { title: true } } },
  });
  if (application) {
    await createNotification(
      application.studentId,
      "Scholarship application update",
      `We couldn't offer a scholarship for "${application.course.title}" at this time.${note ? ` ${note}` : ""}`
    );
  }

  refresh();
  return { ok: true };
}
