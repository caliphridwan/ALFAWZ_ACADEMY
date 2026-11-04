"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { notifyAdmins } from "@/lib/notify-admins";
import { imagePathSchema } from "@/lib/validations/schemas";

export type ClaimFormState = {
  success: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

async function requireStudentId() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") throw new Error("Unauthorized.");
  return session.user.id;
}

const claimSchema = z.object({
  courseId: z.string().min(1, "Choose a course"),
  senderName: z.string().trim().min(2, "Enter the name on the account you sent from").max(120),
  amount: z.coerce.number().positive("Enter the amount you sent").max(100_000_000),
  paidOn: z.string().optional(),
  receiptUrl: imagePathSchema,
  note: z.string().trim().max(500).optional(),
});

export async function submitBankClaim(_prev: ClaimFormState, formData: FormData): Promise<ClaimFormState> {
  const studentId = await requireStudentId();

  const parsed = claimSchema.safeParse({
    courseId: formData.get("courseId") ?? "",
    senderName: formData.get("senderName") ?? "",
    amount: formData.get("amount") ?? "",
    paidOn: formData.get("paidOn") || undefined,
    receiptUrl: formData.get("receiptUrl") || "",
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const data = parsed.data;

  const [course, enrollment, pending, student] = await Promise.all([
    prisma.course.findUnique({ where: { id: data.courseId }, select: { id: true, title: true, active: true } }),
    prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId: data.courseId } },
      select: { status: true },
    }),
    prisma.bankTransferClaim.findFirst({ where: { studentId, courseId: data.courseId, status: "PENDING" } }),
    prisma.user.findUnique({ where: { id: studentId }, select: { name: true } }),
  ]);
  if (!course || !course.active) return { success: false, formError: "That course isn't available." };
  if (enrollment?.status === "ACTIVE") {
    return { success: false, formError: "You're already enrolled in this course." };
  }
  if (pending) {
    return { success: false, formError: "You already have a receipt waiting for review for this course." };
  }

  const paidOn = data.paidOn ? new Date(`${data.paidOn}T12:00:00+01:00`) : null;

  await prisma.bankTransferClaim.create({
    data: {
      studentId,
      courseId: course.id,
      senderName: data.senderName,
      amount: data.amount,
      paidOn: paidOn && !Number.isNaN(paidOn.getTime()) ? paidOn : null,
      receiptUrl: data.receiptUrl || null,
      note: data.note || null,
    },
  });

  await notifyAdmins(
    "Bank transfer to review",
    `${student?.name ?? "A student"} says they paid for "${course.title}". Open Bank Transfers to check and approve.`
  );

  revalidatePath("/dashboard/bank-transfer");
  revalidatePath("/admin/bank-transfers");
  return { success: true };
}
