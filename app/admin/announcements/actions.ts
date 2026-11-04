"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createNotification } from "@/lib/notifications";
import { sendAnnouncementEmail } from "@/lib/email/send";

export type AnnouncementFormState = {
  success: boolean;
  recipients?: number;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

const announcementSchema = z.object({
  courseId: z.string().optional(),
  title: z.string().trim().min(3, "Add a short title").max(120),
  message: z.string().trim().min(5, "Write your message").max(2000),
});

// Safety cap so one send can't run for minutes or flood the email provider.
const MAX_RECIPIENTS = 500;

/**
 * Sends to every actively enrolled student of one course (or of any course).
 * Each person gets an in-app notification (which also pushes to their phone
 * if they turned that on) and an email.
 */
export async function sendAnnouncement(
  _prev: AnnouncementFormState,
  formData: FormData
): Promise<AnnouncementFormState> {
  await requireAdmin();

  const parsed = announcementSchema.safeParse({
    courseId: formData.get("courseId") || undefined,
    title: formData.get("title") ?? "",
    message: formData.get("message") ?? "",
  });
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const { courseId, title, message } = parsed.data;

  let courseTitle: string | null = null;
  if (courseId) {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { title: true } });
    if (!course) return { success: false, formError: "Course not found." };
    courseTitle = course.title;
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { status: "ACTIVE", ...(courseId ? { courseId } : {}), student: { isActive: true } },
    select: { student: { select: { id: true, name: true, email: true } } },
  });

  const unique = new Map(enrollments.map((e) => [e.student.id, e.student] as const));
  const students = Array.from(unique.values());
  if (students.length === 0) {
    return { success: false, formError: "No active students to send this to." };
  }
  if (students.length > MAX_RECIPIENTS) {
    return { success: false, formError: `Too many recipients (${students.length}). Send it per course instead.` };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let delivered = 0;

  // A few at a time: fast enough, gentle on the email provider.
  for (let i = 0; i < students.length; i += 10) {
    await Promise.all(
      students.slice(i, i + 10).map(async (student) => {
        await createNotification(student.id, title, message);
        try {
          await sendAnnouncementEmail({
            to: student.email,
            name: student.name,
            title,
            message,
            courseTitle,
            dashboardUrl: `${appUrl}/dashboard/notifications`,
          });
          delivered += 1;
        } catch (err) {
          console.error(`Announcement email failed for student ${student.id}:`, err);
        }
      })
    );
  }

  await prisma.announcement.create({
    data: { courseId: courseId || null, title, message, recipients: students.length },
  });

  revalidatePath("/admin/announcements");
  return { success: true, recipients: students.length };
}
