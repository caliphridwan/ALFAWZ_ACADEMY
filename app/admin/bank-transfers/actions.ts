"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { activateEnrollment } from "@/lib/enrollment-activation";
import { createNotification } from "@/lib/notifications";

type Result = { ok: boolean; error?: string };

function refresh() {
  revalidatePath("/admin/bank-transfers");
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}

/** Approve: enrols the student, records the payment, marks the claim approved. */
export async function approveBankClaim(claimId: string): Promise<Result> {
  const session = await requireAdmin();

  // Claim it first so a double-click can't enrol (and charge to revenue) twice.
  const claimed = await prisma.bankTransferClaim.updateMany({
    where: { id: claimId, status: "PENDING" },
    data: { status: "APPROVED", reviewedAt: new Date(), reviewedById: session.user.id },
  });
  if (claimed.count === 0) return { ok: false, error: "This receipt was already reviewed." };

  const claim = await prisma.bankTransferClaim.findUnique({ where: { id: claimId } });
  if (!claim) return { ok: false, error: "Receipt not found." };

  const result = await activateEnrollment({
    studentId: claim.studentId,
    courseId: claim.courseId,
    reason: "OFFLINE_PAYMENT",
    note: `Bank transfer from ${claim.senderName}`,
    adminId: session.user.id,
    amount: Number(claim.amount),
  });

  if (!result.ok) {
    // Put it back so it can be dealt with.
    await prisma.bankTransferClaim.update({
      where: { id: claimId },
      data: { status: "PENDING", reviewedAt: null, reviewedById: null },
    });
    return { ok: false, error: result.error };
  }

  refresh();
  return { ok: true };
}

export async function rejectBankClaim(claimId: string, reason: string): Promise<Result> {
  const session = await requireAdmin();
  const note = reason.trim().slice(0, 500);
  if (note.length < 3) return { ok: false, error: "Please give a short reason so the student knows what to do." };

  const claimed = await prisma.bankTransferClaim.updateMany({
    where: { id: claimId, status: "PENDING" },
    data: { status: "REJECTED", reviewNote: note, reviewedAt: new Date(), reviewedById: session.user.id },
  });
  if (claimed.count === 0) return { ok: false, error: "This receipt was already reviewed." };

  const claim = await prisma.bankTransferClaim.findUnique({
    where: { id: claimId },
    select: { studentId: true, course: { select: { title: true } } },
  });
  if (claim) {
    await createNotification(
      claim.studentId,
      "We couldn't confirm your payment",
      `Your bank transfer receipt for "${claim.course.title}" wasn't approved: ${note} You can submit it again from your dashboard.`
    );
  }

  refresh();
  return { ok: true };
}
