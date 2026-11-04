"use server";

import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { isPushConfigured, sendPushToUser } from "@/lib/push";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized.");
  return session.user.id;
}

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2000).refine((v) => v.startsWith("https://"), "Endpoint must be https"),
  p256dh: z.string().min(10).max(300),
  auth: z.string().min(10).max(100),
});

/** Remembers this device so it can receive push notifications. */
// Returns a result instead of throwing: Next hides thrown server-action
// messages in production, which would leave the person (and us) guessing.
export async function savePushSubscription(
  input: z.infer<typeof subscriptionSchema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await requireUserId();
    const parsed = subscriptionSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "The device sent an invalid subscription." };
    const data = parsed.data;
    const userAgent = headers().get("user-agent")?.slice(0, 300) ?? null;

    // A browser's endpoint is unique to that browser; if a different person
    // logs in on the same device, the subscription moves to them.
    await prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      create: { userId, ...data, userAgent },
      update: { userId, p256dh: data.p256dh, auth: data.auth, userAgent },
    });
    return { ok: true };
  } catch (err) {
    console.error("savePushSubscription failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    // A missing table means the database migration hasn't been applied yet.
    if (/PushSubscription|does not exist|P2021/i.test(message)) {
      return { ok: false, error: "The server database is missing the notifications table (run the migration)." };
    }
    return { ok: false, error: "The server could not save this device." };
  }
}

export async function removePushSubscription(endpoint: string) {
  const userId = await requireUserId();
  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId } });
}

/** Lets the person confirm it works. Returns how many devices were reached. */
export async function sendTestPush(): Promise<{ configured: boolean; sent: number }> {
  const userId = await requireUserId();
  if (!isPushConfigured()) return { configured: false, sent: 0 };
  const { sent } = await sendPushToUser(userId, {
    title: "Notifications are on ✅",
    body: "You'll get class reminders and updates from AlFawz Academy here.",
  });
  return { configured: true, sent };
}
