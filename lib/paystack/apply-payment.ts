import "server-only";
import { prisma } from "@/lib/db/prisma";
import { koboToNaira, type PaystackVerifyResponse } from "@/lib/paystack/client";
import { sendPaymentConfirmationEmail, sendSponsorWelcomeEmail } from "@/lib/email/send";
import { createNotification } from "@/lib/notifications";
import { createPasswordSetupToken, buildPasswordSetupUrl } from "@/lib/auth/password-setup";

type ApplyResult =
  | { outcome: "already_processed" }
  | { outcome: "amount_mismatch" }
  | { outcome: "not_found" }
  | { outcome: "applied"; type: "COURSE" | "SPONSORSHIP" }
  | { outcome: "marked_failed" };

/**
 * The single, idempotent function that turns a Paystack-confirmed
 * transaction into an updated Payment + activated Enrollment/Sponsorship.
 * Called from BOTH the callback-verify route and the webhook route, so
 * whichever one lands first "wins" and the other is a safe no-op
 * (Section 15 step 10, Section 42: "the webhook must be idempotent").
 */
export async function applyVerifiedPayment(
  verification: PaystackVerifyResponse["data"]
): Promise<ApplyResult> {
  const payment = await prisma.payment.findUnique({
    where: { reference: verification.reference },
    include: { course: true, sponsorship: true },
  });

  if (!payment) return { outcome: "not_found" };

  // Idempotency guard: if we already marked this SUCCESSFUL, do nothing further.
  if (payment.status === "SUCCESSFUL") return { outcome: "already_processed" };

  if (verification.status !== "success") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return { outcome: "marked_failed" };
  }

  // Defense against amount tampering: the amount Paystack confirms must match
  // what we recorded when the payment was initialized.
  const paidNaira = koboToNaira(verification.amount);
  const expectedNaira = Number(payment.amount);
  if (Math.abs(paidNaira - expectedNaira) > 0.01) {
    console.error(
      `Amount mismatch for payment ${payment.id}: expected ${expectedNaira}, Paystack reports ${paidNaira}`
    );
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return { outcome: "amount_mismatch" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCESSFUL", paidAt: new Date() },
    });

    if (payment.type === "COURSE" && payment.courseId) {
      await tx.enrollment.updateMany({
        where: { studentId: payment.userId, courseId: payment.courseId },
        data: { status: "ACTIVE" },
      });
    }

    if (payment.type === "SPONSORSHIP" && payment.sponsorshipId) {
      await tx.sponsorship.update({
        where: { id: payment.sponsorshipId },
        data: { status: "ACTIVE" },
      });
    }
  });

  // In-app notification, created only after the payment was verified above.
  if (payment.type === "COURSE") {
    await createNotification(
      payment.userId,
      "Enrollment confirmed",
      `Your payment was received and you are now enrolled in ${payment.course?.title ?? "your course"}.`
    );
  } else {
    await createNotification(
      payment.userId,
      "Sponsorship confirmed",
      "Your sponsorship payment was received. Jazakallahu khairan for supporting students."
    );
  }

  const user = await prisma.user.findUnique({ where: { id: payment.userId } });
  if (user) {
    await sendPaymentConfirmationEmail({
      to: user.email,
      name: user.name,
      amount: expectedNaira,
      currency: payment.currency,
      type: payment.type,
    }).catch((err) => console.error("Payment confirmation email failed:", err));

    // First-time sponsor accounts are created at checkout with no password
    // (Section 22/18). Rather than leave them with no way to discover their
    // dashboard exists, send a one-time setup link right after their first
    // successful payment. Only fires when there's genuinely no password yet,
    // so it never re-fires on a returning sponsor's second sponsorship.
    if (payment.type === "SPONSORSHIP" && !user.passwordHash) {
      const rawToken = await createPasswordSetupToken(user.email);
      await sendSponsorWelcomeEmail({
        to: user.email,
        name: user.name,
        setupUrl: buildPasswordSetupUrl(user.email, rawToken),
      }).catch((err) => console.error("Sponsor welcome email failed:", err));
    }
  }

  return { outcome: "applied", type: payment.type };
}
