"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function setMessageStatus(messageId: string, status: "NEW" | "READ" | "RESOLVED") {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id: messageId }, data: { status } });
  revalidatePath("/admin/messages");
}
