"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sendImpactUpdatesToSponsors } from "@/lib/sponsor-impact-send";

export async function setSponsorshipPublicDisplay(
  sponsorshipId: string,
  showPublicly: boolean,
  publicName?: string
) {
  await requireAdmin();

  await prisma.sponsorship.update({
    where: { id: sponsorshipId },
    data: { showPublicly, ...(publicName !== undefined ? { publicName } : {}) },
  });

  revalidatePath("/admin/sponsors");
  revalidatePath("/sponsors");
}

export async function setSponsorshipStatus(
  sponsorshipId: string,
  status: "ACTIVE" | "CANCELLED" | "EXPIRED"
) {
  await requireAdmin();

  await prisma.sponsorship.update({ where: { id: sponsorshipId }, data: { status } });

  revalidatePath("/admin/sponsors");
  revalidatePath("/sponsors");
}

/** Email every active sponsor their impact figures (button on /admin/sponsors). */
export async function sendImpactUpdates(): Promise<{ ok: boolean; sent: number; failed: number; error?: string }> {
  await requireAdmin();
  return sendImpactUpdatesToSponsors();
}

type ImpactInput = {
  supportedOverride: number | null;
  completedOverride: number | null;
  certificatesOverride: number | null;
  attendanceOverride: number | null;
  recitationOverride: number | null;
  passRateOverride: number | null;
  note: string;
};

/** Save the figures sponsors will see. A null number means "use the automatic figure". */
export async function saveImpactSettings(input: ImpactInput, sponsorId: string | null = null): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const whole = (v: number | null, max: number) => v === null || (Number.isInteger(v) && v >= 0 && v <= max);
  if (
    !whole(input.supportedOverride, 100000) ||
    !whole(input.completedOverride, 100000) ||
    !whole(input.certificatesOverride, 100000) ||
    !whole(input.attendanceOverride, 100) ||
    !whole(input.passRateOverride, 100)
  ) {
    return { ok: false, error: "Use whole numbers (percentages must be 0 to 100)." };
  }
  const r = input.recitationOverride;
  if (r !== null && !(r >= 0 && r <= 5)) return { ok: false, error: "Recitation rating must be between 0 and 5." };

  const data = {
    supportedOverride: input.supportedOverride,
    completedOverride: input.completedOverride,
    certificatesOverride: input.certificatesOverride,
    attendanceOverride: input.attendanceOverride,
    recitationOverride: r,
    passRateOverride: input.passRateOverride,
    note: input.note.trim().slice(0, 2000) || null,
  };
  if (sponsorId) {
    const exists = await prisma.user.findUnique({ where: { id: sponsorId }, select: { id: true } });
    if (!exists) return { ok: false, error: "Sponsor not found." };
    await prisma.sponsorImpact.upsert({
      where: { sponsorId },
      update: data,
      create: { sponsorId, ...data },
    });
  } else {
    await prisma.sponsorImpactSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
  }
  revalidatePath("/sponsor/dashboard/impact");
  revalidatePath("/admin/sponsors/impact", "layout");
  return { ok: true };
}
