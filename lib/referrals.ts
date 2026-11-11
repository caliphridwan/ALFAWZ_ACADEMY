import "server-only";
import { prisma } from "@/lib/db/prisma";
import { generateCode } from "@/lib/referral-code";

/** The student's personal invite code, created the first time they ask for it. */
export async function getOrCreateOwnCode(userId: string, name: string) {
  const existing = await prisma.referralCode.findUnique({ where: { ownerId: userId } });
  if (existing) return existing;

  for (let i = 0; i < 6; i++) {
    try {
      return await prisma.referralCode.create({
        data: { code: generateCode(), label: name, ownerId: userId },
      });
    } catch (err: any) {
      if (err?.code !== "P2002") throw err;
      // Either the random code collided, or a second request created this student's code first.
      const again = await prisma.referralCode.findUnique({ where: { ownerId: userId } });
      if (again) return again;
    }
  }
  throw new Error("Could not create a referral code.");
}
