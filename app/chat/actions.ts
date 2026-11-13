"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { chatAccess, loadSnapshot, markChatRead, type ChatSnapshot } from "@/lib/chat";

const MAX_BODY = 1000;
const MAX_VOICE_SECONDS = 180;

async function viewer() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized.");
  return { id: session.user.id, role: session.user.role as string };
}

/** Called every few seconds by the open chat: latest messages, and marks them read. */
export async function pollChat(courseId: string): Promise<ChatSnapshot | null> {
  const me = await viewer();
  const access = await chatAccess(courseId, me);
  if (!access.ok) return null;
  const [snap] = await Promise.all([loadSnapshot(courseId, me, access.canModerate), markChatRead(courseId, me.id)]);
  return snap;
}

export async function sendChatMessage(
  courseId: string,
  body: string,
  voice?: { url: string; durationSec: number | null }
): Promise<{ ok: boolean; error?: string }> {
  const me = await viewer();
  const access = await chatAccess(courseId, me);
  if (!access.ok) return { ok: false, error: "You don't have access to this chat." };

  const text = body.trim().slice(0, MAX_BODY);
  let audioUrl: string | null = null;
  let durationSec: number | null = null;
  if (voice) {
    try {
      const u = new URL(voice.url);
      if (u.protocol !== "https:" || u.hostname !== "res.cloudinary.com" || voice.url.length > 600) throw new Error();
      audioUrl = voice.url;
    } catch {
      return { ok: false, error: "The voice note didn't upload correctly. Please try again." };
    }
    const d = voice.durationSec;
    durationSec = d && d > 0 && d <= MAX_VOICE_SECONDS + 5 ? Math.round(d) : null;
  }
  if (!text && !audioUrl) return { ok: false, error: "Write a message first." };

  const member = await prisma.courseChatMember.findUnique({
    where: { courseId_userId: { courseId, userId: me.id } },
    select: { muted: true },
  });
  if (member?.muted) return { ok: false, error: "You can't send messages in this chat right now." };

  // Light flood guard: no more than one message per second per person.
  const last = await prisma.courseMessage.findFirst({
    where: { courseId, senderId: me.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (last && Date.now() - last.createdAt.getTime() < 1000) {
    return { ok: false, error: "You're sending messages too fast." };
  }

  await prisma.courseMessage.create({
    data: { courseId, senderId: me.id, body: text || null, audioUrl, durationSec },
  });
  await markChatRead(courseId, me.id);
  return { ok: true };
}

/** A sender can remove their own message; teacher/admin can remove anyone's. */
export async function deleteChatMessage(messageId: string): Promise<{ ok: boolean; error?: string }> {
  const me = await viewer();
  const msg = await prisma.courseMessage.findUnique({
    where: { id: messageId },
    select: { courseId: true, senderId: true, deletedAt: true },
  });
  if (!msg || msg.deletedAt) return { ok: true };
  const access = await chatAccess(msg.courseId, me);
  if (!access.ok) return { ok: false, error: "Not allowed." };
  if (msg.senderId !== me.id && !access.canModerate) return { ok: false, error: "Not allowed." };
  await prisma.courseMessage.update({ where: { id: messageId }, data: { deletedAt: new Date() } });
  return { ok: true };
}

/** Teacher/admin: stop (or allow again) one student from posting in a course chat. */
export async function setChatMuted(
  courseId: string,
  userId: string,
  muted: boolean
): Promise<{ ok: boolean; error?: string }> {
  const me = await viewer();
  const access = await chatAccess(courseId, me);
  if (!access.ok || !access.canModerate) return { ok: false, error: "Not allowed." };
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target || target.role !== "STUDENT") return { ok: false, error: "Only students can be muted." };
  await prisma.courseChatMember.upsert({
    where: { courseId_userId: { courseId, userId } },
    create: { courseId, userId, muted },
    update: { muted },
  });
  return { ok: true };
}
