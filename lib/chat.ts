import "server-only";
import { prisma } from "@/lib/db/prisma";

export type ChatViewer = { id: string; role: string };

export type ChatAccess =
  | { ok: false }
  | { ok: true; kind: "student" | "teacher" | "admin"; canModerate: boolean };

const LIVE = ["ACTIVE", "COMPLETED"] as const;

/** Who may open a course's chat: its enrolled students, its teacher, and admins. */
export async function chatAccess(courseId: string, viewer: ChatViewer): Promise<ChatAccess> {
  if (viewer.role === "ADMIN" || viewer.role === "SUPER_ADMIN") {
    const exists = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    return exists ? { ok: true, kind: "admin", canModerate: true } : { ok: false };
  }
  if (viewer.role === "TEACHER") {
    const own = await prisma.course.findFirst({
      where: { id: courseId, instructor: { is: { userId: viewer.id } } },
      select: { id: true },
    });
    return own ? { ok: true, kind: "teacher", canModerate: true } : { ok: false };
  }
  if (viewer.role === "STUDENT") {
    const e = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: viewer.id, courseId } },
      select: { status: true },
    });
    return e && (LIVE as readonly string[]).includes(e.status)
      ? { ok: true, kind: "student", canModerate: false }
      : { ok: false };
  }
  return { ok: false };
}

export type ChatMessageDTO = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  body: string | null;
  audioUrl: string | null;
  durationSec: number | null;
  createdAt: string;
};

export type ChatSnapshot = {
  messages: ChatMessageDTO[];
  /** Whether the viewer has been muted in this chat. */
  mutedMe: boolean;
  /** Muted people, only filled for moderators. */
  mutedIds: string[];
};

export const CHAT_PAGE_SIZE = 100;

/** The latest messages (oldest first) plus mute state. Does not mark anything read. */
export async function loadSnapshot(courseId: string, viewer: ChatViewer, canModerate: boolean): Promise<ChatSnapshot> {
  const [rows, me, muted] = await Promise.all([
    prisma.courseMessage.findMany({
      where: { courseId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: CHAT_PAGE_SIZE,
      select: {
        id: true,
        senderId: true,
        body: true,
        audioUrl: true,
        durationSec: true,
        createdAt: true,
        sender: { select: { name: true, role: true } },
      },
    }),
    prisma.courseChatMember.findUnique({
      where: { courseId_userId: { courseId, userId: viewer.id } },
      select: { muted: true },
    }),
    canModerate
      ? prisma.courseChatMember.findMany({ where: { courseId, muted: true }, select: { userId: true } })
      : Promise.resolve([] as { userId: string }[]),
  ]);
  return {
    messages: rows.reverse().map((m) => ({
      id: m.id,
      senderId: m.senderId,
      senderName: m.sender.name,
      senderRole: m.sender.role,
      body: m.body,
      audioUrl: m.audioUrl,
      durationSec: m.durationSec,
      createdAt: m.createdAt.toISOString(),
    })),
    mutedMe: !!me?.muted,
    mutedIds: muted.map((x) => x.userId),
  };
}

/** Record that the viewer has read everything up to now. */
export async function markChatRead(courseId: string, userId: string) {
  await prisma.courseChatMember.upsert({
    where: { courseId_userId: { courseId, userId } },
    create: { courseId, userId },
    update: { lastReadAt: new Date() },
  });
}

/**
 * Unread message counts per course for one person (messages from others since
 * they last opened that chat; for a first visit, since they enrolled).
 */
export async function unreadChatCounts(userId: string, role: string): Promise<Map<string, number>> {
  let courses: { courseId: string; since: Date }[] = [];
  if (role === "STUDENT") {
    const rows = await prisma.enrollment.findMany({
      where: { studentId: userId, status: { in: [...LIVE] } },
      select: { courseId: true, enrolledAt: true },
    });
    courses = rows.map((r) => ({ courseId: r.courseId, since: r.enrolledAt }));
  } else if (role === "TEACHER") {
    const rows = await prisma.course.findMany({
      where: { instructor: { is: { userId } } },
      select: { id: true, createdAt: true },
    });
    courses = rows.map((r) => ({ courseId: r.id, since: r.createdAt }));
  } else {
    return new Map();
  }
  if (!courses.length) return new Map();

  const members = await prisma.courseChatMember.findMany({
    where: { userId, courseId: { in: courses.map((c) => c.courseId) } },
    select: { courseId: true, lastReadAt: true },
  });
  const lastRead = new Map(members.map((m) => [m.courseId, m.lastReadAt]));

  const counts = await Promise.all(
    courses.map((c) =>
      prisma.courseMessage.count({
        where: {
          courseId: c.courseId,
          deletedAt: null,
          senderId: { not: userId },
          createdAt: { gt: lastRead.get(c.courseId) ?? c.since },
        },
      })
    )
  );
  return new Map(courses.map((c, i) => [c.courseId, counts[i]]));
}

export async function totalUnreadChat(userId: string, role: string): Promise<number> {
  const map = await unreadChatCounts(userId, role);
  let n = 0;
  map.forEach((v) => (n += v));
  return n;
}
