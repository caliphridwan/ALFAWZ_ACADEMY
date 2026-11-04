import "server-only";
import { prisma } from "@/lib/db/prisma";
import { sendClassReminderEmail } from "@/lib/email/send";
import { createNotification } from "@/lib/notifications";
import { formatAcademyTime } from "@/lib/utils/datetime";

// The cron job runs every 15 minutes, so looking 75 minutes ahead means a
// reminder lands roughly 60–75 minutes before class — "about an hour".
const REMIND_WITHIN_MINUTES = 75;
// A class that started a few minutes ago (cron delay, or a session added
// at the last minute) is still worth a heads-up; older than this is not.
const GRACE_MINUTES_AFTER_START = 10;
// Safety cap so one run can't fire a huge number of emails at once.
const MAX_SESSIONS_PER_RUN = 20;

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export type ClassReminderResult = {
  sessions: number;
  sent: number;
  failed: number;
};

/**
 * Emails (and posts an in-app notification to) every actively enrolled
 * student of each class starting within the next ~hour, once per class.
 * Each session is marked reminderSentAt after its students have been
 * attempted — so a student whose email failed isn't retried (that would
 * re-send to everyone else who already got it); failures are counted and
 * logged instead.
 */
export async function sendUpcomingClassReminders(): Promise<ClassReminderResult> {
  const now = Date.now();
  const from = new Date(now - GRACE_MINUTES_AFTER_START * 60 * 1000);
  const to = new Date(now + REMIND_WITHIN_MINUTES * 60 * 1000);

  const sessions = await prisma.classSession.findMany({
    where: {
      cancelled: false,
      reminderSentAt: null,
      startsAt: { gte: from, lte: to },
    },
    include: {
      course: {
        include: {
          enrollments: {
            where: { status: "ACTIVE" },
            include: { student: true },
          },
        },
      },
    },
    orderBy: { startsAt: "asc" },
    take: MAX_SESSIONS_PER_RUN,
  });

  const result: ClassReminderResult = { sessions: sessions.length, sent: 0, failed: 0 };

  for (const session of sessions) {
    const { course } = session;
    const zoomLink = session.zoomLink || course.zoomLink;

    for (const enrollment of course.enrollments) {
      const { student } = enrollment;
      if (!student.isActive) continue;

      try {
        await sendClassReminderEmail({
          to: student.email,
          name: student.name,
          courseTitle: course.title,
          startsAt: session.startsAt,
          durationMinutes: session.durationMinutes,
          topic: session.topic,
          zoomLink,
          dashboardUrl: `${appUrl()}/dashboard/schedule`,
        });

        await createNotification(
          student.id,
          "Class starting soon",
          `"${course.title}" begins at ${formatAcademyTime(session.startsAt)} (WAT).`
        );

        result.sent += 1;
      } catch (err) {
        console.error(
          `Failed to send class reminder (session ${session.id}, student ${student.id}):`,
          err
        );
        result.failed += 1;
      }
    }

    await prisma.classSession.update({
      where: { id: session.id },
      data: { reminderSentAt: new Date() },
    });
  }

  return result;
}
