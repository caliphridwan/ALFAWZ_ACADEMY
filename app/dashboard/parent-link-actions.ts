"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

async function requireStudent() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized.");
  }
  return session.user.id;
}

/**
 * Creates (or replaces) the secret token behind the student's read-only
 * parent link. Replacing it invalidates any link shared earlier.
 */
export async function createParentLink() {
  const userId = await requireStudent();
  const token = randomBytes(24).toString("base64url");

  await prisma.user.update({ where: { id: userId }, data: { parentShareToken: token } });
  revalidatePath("/dashboard/profile");
}

export async function revokeParentLink() {
  const userId = await requireStudent();

  await prisma.user.update({ where: { id: userId }, data: { parentShareToken: null } });
  revalidatePath("/dashboard/profile");
}
