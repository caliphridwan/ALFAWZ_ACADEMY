"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { generateCode, normalizeCode } from "@/lib/referral-code";

/** Create a campaign link such as "WhatsApp group" or "Flyer, Kano". Leave the code blank to get a random one. */
export async function createCampaignCode(label: string, code: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const cleanLabel = label.trim().slice(0, 80);
  if (!cleanLabel) return { ok: false, error: "Give the link a name, for example “WhatsApp group”." };

  let finalCode: string | null;
  if (code.trim()) {
    finalCode = normalizeCode(code);
    if (!finalCode) return { ok: false, error: "A code uses 3 to 24 letters, numbers or dashes." };
    if (await prisma.referralCode.findUnique({ where: { code: finalCode }, select: { id: true } })) {
      return { ok: false, error: "That code is already taken." };
    }
  } else {
    finalCode = null;
    for (let i = 0; i < 5 && !finalCode; i++) {
      const candidate = generateCode();
      if (!(await prisma.referralCode.findUnique({ where: { code: candidate }, select: { id: true } }))) finalCode = candidate;
    }
    if (!finalCode) return { ok: false, error: "Could not make a unique code. Try again." };
  }

  await prisma.referralCode.create({ data: { code: finalCode, label: cleanLabel } });
  revalidatePath("/admin/referrals");
  return { ok: true };
}

/** Switch a link off (visitors still land on the site, but are no longer tracked) or back on. */
export async function setReferralActive(id: string, active: boolean): Promise<{ ok: boolean }> {
  await requireAdmin();
  await prisma.referralCode.update({ where: { id }, data: { active } });
  revalidatePath("/admin/referrals");
  return { ok: true };
}
