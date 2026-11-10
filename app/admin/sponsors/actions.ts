"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getFundImpact } from "@/lib/sponsor-impact";
import { sendSponsorImpactEmail } from "@/lib/email/send";
import { createNotification } from "@/lib/notifications";

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

/** Email every active sponsor the current group-level impact figures. */
export async function sendImpactUpdates(): Promise<{ ok: boolean; sent: number; failed: number; error?: string }> {
  await requireAdmin();

  const [fund, sponsorships] = await Promise.all([
    getFundImpact(),
    prisma.sponsorship.findMany({
      where: { status: "ACTIVE" },
      select: { numberOfStudents: true, sponsor: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const bySponsor = new Map<string, { name: string; email: string; places: number }>();
  for (const s of sponsorships) {
    const cur = bySponsor.get(s.sponsor.id);
    if (cur) cur.places += s.numberOfStudents;
    else bySponsor.set(s.sponsor.id, { name: s.sponsor.name ?? "Sponsor", email: s.sponsor.email, places: s.numberOfStudents });
  }
  if (bySponsor.size === 0) return { ok: false, sent: 0, failed: 0, error: "There are no active sponsors." };
  if (fund.supported === 0) return { ok: false, sent: 0, failed: 0, error: "No students have been placed from the fund yet." };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let sent = 0;
  let failed = 0;
  for (const [id, sp] of Array.from(bySponsor.entries())) {
    try {
      await sendSponsorImpactEmail({
        to: sp.email,
        name: sp.name,
        myPlaces: sp.places,
        supported: fund.supported,
        completed: fund.completedSmall || fund.completed === 0 ? null : fund.completed,
        attendancePct: fund.attendancePct,
        recitationAvg: fund.recitationAvg,
        passRatePct: fund.passRatePct,
        note: fund.note,
        dashboardUrl: `${appUrl}/sponsor/dashboard/impact`,
      });
      await createNotification(id, "Your impact update", "See how the fund is supporting students this term.", "/sponsor/dashboard/impact");
      sent++;
    } catch {
      failed++;
    }
  }
  return { ok: true, sent, failed };
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
export async function saveImpactSettings(input: ImpactInput): Promise<{ ok: boolean; error?: string }> {
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
  await prisma.sponsorImpactSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  revalidatePath("/sponsor/dashboard/impact");
  revalidatePath("/admin/sponsors/impact");
  return { ok: true };
}
