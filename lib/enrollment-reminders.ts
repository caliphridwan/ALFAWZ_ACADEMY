import "server-only";
import { prisma } from "@/lib/db/prisma";
import { sendEnrollmentReminderEmail } from "@/lib/email/send";
import { createNotification } from "@/lib/notifications";

// Give a new student a day to browse and enroll on their own before
// reminding them — avoids emailing someone five minutes after they sign up.
const MIN_HOURS_SINCE_REGISTRATION = 24;
// Once reminded, don't remind the same student again for at least a week —
// this is a much gentler nudge than the pending-payment reminder, which has
// an active deadline behind it.
const MIN_HOURS_BETWEEN_REMINDERS = 24 * 7;
// Safety cap per run so one call can't fire thousands of emails at once.
const MAX_PER_RUN = 200;

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export type EnrollmentReminderResult = {
  checked: number;
  sent: number;
  failed: number;
};

/**
 * Finds active STUDENT accounts with zero enrollments at all (registered,
 * never picked a course) and emails them a nudge to browse courses.
 * Throttled so a given student gets at most one reminder per week. Called
 * by the protected cron API route and by the admin's manual
 * "Send Enrollment Reminders Now" action — both go through this one
 * function so the throttling logic only lives in one place.
 */
export async function sendNeverEnrolledReminders(): Promise<EnrollmentReminderResult> {
  const now = Date.now();
  const registeredBefore = new Date(now - MIN_HOURS_SINCE_REGISTRATION * 60 * 60 * 1000);
  const reminderCutoff = new Date(now - MIN_HOURS_BETWEEN_REMINDERS * 60 * 60 * 1000);

  const candidates = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      isActive: true,
      createdAt: { lte: registeredBefore },
      enrollments: { none: {} },
      OR: [{ enrollmentReminderSentAt: null }, { enrollmentReminderSentAt: { lte: reminderCutoff } }],
    },
    take: MAX_PER_RUN,
    orderBy: { createdAt: "asc" },
  });

  const result: EnrollmentReminderResult = { checked: candidates.length, sent: 0, failed: 0 };

  for (const student of candidates) {
    try {
      await sendEnrollmentReminderEmail({
        to: student.email,
        name: student.name,
        dashboardUrl: `${appUrl()}/dashboard`,
        browseCoursesUrl: `${appUrl()}/courses`,
      });

      await prisma.user.update({
        where: { id: student.id },
        data: { enrollmentReminderSentAt: new Date(), enrollmentReminderCount: { increment: 1 } },
      });

      await createNotification(
        student.id,
        "Course reminder sent",
        "We emailed you a reminder to browse and enroll in a course."
      );

      result.sent += 1;
    } catch (err) {
      console.error(`Failed to send enrollment reminder to user ${student.id}:`, err);
      result.failed += 1;
    }
  }

  return result;
}
