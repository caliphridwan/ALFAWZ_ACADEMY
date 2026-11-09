import "server-only";
import { prisma } from "@/lib/db/prisma";
import { sendPushToUser } from "@/lib/push";
import { notificationHref } from "@/lib/notification-links";

/**
 * Notifications are a convenience, never a dependency: if creating one
 * fails, the payment/enrollment flow that triggered it must not fail too.
 * Every notification is also pushed to the user's phone/browser if they
 * have turned that on (a no-op for everyone else).
 */
export async function createNotification(userId: string, title: string, message: string, href?: string) {
  try {
    await prisma.notification.create({ data: { userId, title, message } });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
  // Tapping the phone notification opens the page it is about.
  await sendPushToUser(userId, { title, body: message, url: href ?? notificationHref(title) ?? "/dashboard/notifications" });
}
