"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function acknowledgeExamResult(enrollmentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  // studentId in the filter means a student can only ever dismiss their own
  // result — updateMany rather than update so a mismatched id just affects
  // zero rows instead of throwing.
  await prisma.enrollment.updateMany({
    where: { id: enrollmentId, studentId: session.user.id },
    data: { examResultSeen: true },
  });
}
