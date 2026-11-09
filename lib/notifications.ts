import "server-only";
import { prisma } from "@/lib/db/prisma";
import { sendPushToUser } from "@/lib/push";

/**
 * Notifications are a convenience, never a dependency: if creating one
 * fails, the payment/enrollment flow that triggered it must not fail too.
 * Every notification is also pushed to the user's phone/browser if they
 * have turned that on (a no-op for everyone else).
 */
export async function createNotification(userId: string, title: string, message: string, href?: string) {
  let id: string | null = null;
  try {
    const created = await prisma.notification.create({ data: { userId, title, message }, select: { id: true } });
    id = created.id;
  } catch (err) {
    console.error("Failed to create notification:", err);
  }

  // Tapping the phone notification opens that exact message (students), or the
  // given page / the person's own area for staff and sponsors.
  let url = href;
  if (!url) {
    const role = await prisma.user
      .findUnique({ where: { id: userId }, select: { role: true } })
      .then((u) => u?.role)
      .catch(() => undefined);
    url = role === "STUDENT" ? (id ? `/dashboard/notifications/${id}` : "/dashboard/notifications") : role === "SPONSOR" ? "/sponsor/dashboard" : "/";
  }
  await sendPushToUser(userId, { title, body: message, url });
}
