import "server-only";
import webpush from "web-push";
import { prisma } from "@/lib/db/prisma";
import { iconUrl } from "@/lib/pwa-icons";

export type PushPayload = {
  title: string;
  body: string;
  /** Page opened when the notification is tapped. */
  url?: string;
};

let configured: boolean | null = null;

/** Web push is optional: without the VAPID keys everything here is a quiet no-op. */
function configure(): boolean {
  if (configured !== null) return configured;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    configured = false;
    return false;
  }
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:contact@alfawzacademy.com",
      publicKey,
      privateKey
    );
    configured = true;
  } catch (err) {
    console.error("Web push is misconfigured (check the VAPID keys):", err);
    configured = false;
  }
  return configured;
}

export function isPushConfigured() {
  return configure();
}

/**
 * Sends a push notification to every device the user has enabled. Never
 * throws: push is a convenience on top of email and in-app notifications.
 * Devices the push service reports as gone (404/410) are removed.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; removed: number }> {
  const result = { sent: 0, removed: 0 };
  if (!configure()) return result;

  try {
    const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
    if (subscriptions.length === 0) return result;

    const body = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url ?? "/dashboard/notifications",
      icon: iconUrl(null, 192),
    });

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            body,
            { TTL: 60 * 60 * 6, timeout: 10_000 }
          );
          result.sent += 1;
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await prisma.pushSubscription.deleteMany({ where: { id: sub.id } });
            result.removed += 1;
          } else {
            console.error("Push send failed:", status ?? err);
          }
        }
      })
    );
  } catch (err) {
    console.error("Push delivery failed:", err);
  }
  return result;
}
