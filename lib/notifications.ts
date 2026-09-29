import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Notifications are a convenience, never a dependency: if creating one
 * fails, the payment/enrollment flow that triggered it must not fail too.
 */
export async function createNotification(userId: string, title: string, message: string) {
  try {
    await prisma.notification.create({ data: { userId, title, message } });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}
