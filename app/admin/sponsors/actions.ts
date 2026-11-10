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
        completed: fund.completed,
        attendancePct: fund.attendancePct,
        passRatePct: fund.passRatePct,
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
