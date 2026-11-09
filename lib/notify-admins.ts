import "server-only";
import { prisma } from "@/lib/db/prisma";
import { createNotification } from "@/lib/notifications";

/** Tell every admin there's something to review (also pushes to their phones if enabled). */
export async function notifyAdmins(title: string, message: string) {
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, isActive: true },
    select: { id: true },
    take: 10,
  });
  for (const a of admins) await createNotification(a.id, title, message, "/admin");
}
