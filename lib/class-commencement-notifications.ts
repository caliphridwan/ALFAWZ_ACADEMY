import "server-only";
import { prisma } from "@/lib/db/prisma";
import { sendClassCommencementEmail } from "@/lib/email/send";
import { createNotification } from "@/lib/notifications";

// Notify once a course's start date is this close, so the email lands with
// enough lead time to actually be useful (not six weeks early, not after
// the fact). A course whose start has already passed is still covered —
// up to a day late — in case an admin sets/changes classStartsAt shortly
// before or just after classes have actually begun.
const NOTIFY_WINDOW_HOURS_BEFORE = 48;
const NOTIFY_WINDOW_HOURS_AFTER = 24;
// Safety cap per run so one call can't fire thousands of emails at once.
const MAX_PER_RUN = 200;

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export type ClassCommencementResult = {
  checked: number;
  sent: number;
  failed: number;
};

/**
 * Finds students who are actively enrolled (payment confirmed) in a course
 * whose classStartsAt now falls inside the notify window, and haven't yet
 * been sent the commencement notice for that enrollment, then emails them
 * the start date/time, duration and schedule. Called by the protected cron
 * API route and by the admin's manual "Send Commencement Notices Now"
 * action — both go through this one function so the throttling/idempotency
 * logic only lives in one place.
 */
export async function sendClassCommencementNotifications(): Promise<ClassCommencementResult> {
  const now = Date.now();
  const windowStart = new Date(now - NOTIFY_WINDOW_HOURS_AFTER * 60 * 60 * 1000);
  const windowEnd = new Date(now + NOTIFY_WINDOW_HOURS_BEFORE * 60 * 60 * 1000);

  const candidates = await prisma.enrollment.findMany({
    where: {
      status: "ACTIVE",
      commencementNotifiedAt: null,
      course: {
        classStartsAt: { gte: windowStart, lte: windowEnd },
      },
    },
    include: { student: true, course: true },
    take: MAX_PER_RUN,
    orderBy: { enrolledAt: "asc" },
  });

  const result: ClassCommencementResult = {
    checked: candidates.length,
    sent: 0,
    failed: 0,
  };

  for (const enrollment of candidates) {
    const { course, student } = enrollment;

    // classStartsAt is guaranteed non-null by the query above, but Prisma's
    // types don't narrow that automatically.
    if (!course.classStartsAt) continue;

    try {
      await sendClassCommencementEmail({
        to: student.email,
        name: student.name,
        courseTitle: course.title,
        startsAt: course.classStartsAt,
        duration: course.duration,
        schedule: course.schedule,
        zoomLink: course.zoomLink,
        dashboardUrl: `${appUrl()}/dashboard`,
      });

      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { commencementNotifiedAt: new Date() },
      });

      await createNotification(
        student.id,
        "Your classes are starting",
        `We emailed you the start date, time and duration for "${course.title}".`
      );

      result.sent += 1;
    } catch (err) {
      console.error(`Failed to send commencement notice for enrollment ${enrollment.id}:`, err);
      result.failed += 1;
    }
  }

  return result;
}
