import "server-only";
import { prisma } from "@/lib/db/prisma";
import { sendPaymentReminderEmail } from "@/lib/email/send";
import { createNotification } from "@/lib/notifications";

// Don't remind a student the instant they start checkout — give the
// Paystack flow (and webhook) a chance to complete first.
const MIN_HOURS_SINCE_ENROLLMENT = 2;
// Once reminded, don't remind again for at least a day.
const MIN_HOURS_BETWEEN_REMINDERS = 24;
// Safety cap per run so one call can't fire thousands of emails at once.
const MAX_PER_RUN = 200;

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export type PaymentReminderResult = {
  checked: number;
  sent: number;
  failed: number;
  skippedClosed: number;
};

/**
 * Finds enrollments that are still PENDING (registered, payment not yet
 * completed) and emails the student a reminder, throttled so each student
 * gets at most one reminder per day. Called by the protected cron API route
 * and by the admin's manual "Send Payment Reminders Now" action — both go
 * through this one function so the throttling logic only lives in one place.
 */
export async function sendPendingPaymentReminders(): Promise<PaymentReminderResult> {
  const now = Date.now();
  const enrolledBefore = new Date(now - MIN_HOURS_SINCE_ENROLLMENT * 60 * 60 * 1000);
  const reminderCutoff = new Date(now - MIN_HOURS_BETWEEN_REMINDERS * 60 * 60 * 1000);

  const candidates = await prisma.enrollment.findMany({
    where: {
      status: "PENDING",
      enrolledAt: { lte: enrolledBefore },
      OR: [{ reminderSentAt: null }, { reminderSentAt: { lte: reminderCutoff } }],
    },
    include: { student: true, course: true },
    take: MAX_PER_RUN,
    orderBy: { enrolledAt: "asc" },
  });

  const result: PaymentReminderResult = {
    checked: candidates.length,
    sent: 0,
    failed: 0,
    skippedClosed: 0,
  };

  for (const enrollment of candidates) {
    const { course, student } = enrollment;

    // Registration deadline already passed — nothing useful to remind
    // about; leave the enrollment as-is for an admin to resolve manually.
    if (course.registrationClosesAt && course.registrationClosesAt.getTime() <= now) {
      result.skippedClosed += 1;
      continue;
    }

    try {
      await sendPaymentReminderEmail({
        to: student.email,
        name: student.name,
        courseTitle: course.title,
        amount: Number(course.price),
        currency: course.currency,
        completePaymentUrl: `${appUrl()}/dashboard`,
        closesAt: course.registrationClosesAt,
      });

      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { reminderSentAt: new Date(), reminderCount: { increment: 1 } },
      });

      await createNotification(
        student.id,
        "Payment reminder sent",
        `We emailed you a reminder to complete payment for "${course.title}".`
      );

      result.sent += 1;
    } catch (err) {
      console.error(`Failed to send payment reminder for enrollment ${enrollment.id}:`, err);
      result.failed += 1;
    }
  }

  return result;
}
