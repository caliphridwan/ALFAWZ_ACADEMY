"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function setStudentActive(studentId: string, isActive: boolean) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: studentId, role: "STUDENT" },
    data: { isActive },
  });

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
}
