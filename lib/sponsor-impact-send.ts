import "server-only";
import { prisma } from "@/lib/db/prisma";
import { getAutoFundImpact, getImpactOverrides, getFundImpact } from "@/lib/sponsor-impact";
import { sendSponsorImpactEmail } from "@/lib/email/send";
import { createNotification } from "@/lib/notifications";

/** Email every active sponsor their own impact figures, plus an in-app notification. */
export async function sendImpactUpdatesToSponsors(onlySponsorId?: string): Promise<{ ok: boolean; sent: number; failed: number; error?: string }> {
  const [auto, fundWide, sponsorships] = await Promise.all([
    getAutoFundImpact(),
    getImpactOverrides(),
    prisma.sponsorship.findMany({
      where: { status: "ACTIVE", ...(onlySponsorId ? { sponsorId: onlySponsorId } : {}) },
      select: { numberOfStudents: true, sponsor: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const bySponsor = new Map<string, { name: string; email: string; places: number }>();
  for (const s of sponsorships) {
    const cur = bySponsor.get(s.sponsor.id);
    if (cur) cur.places += s.numberOfStudents;
    else bySponsor.set(s.sponsor.id, { name: s.sponsor.name ?? "Sponsor", email: s.sponsor.email, places: s.numberOfStudents });
  }
  if (bySponsor.size === 0) return { ok: false, sent: 0, failed: 0, error: onlySponsorId ? "This sponsor has no active sponsorship." : "There are no active sponsors." };
  if (auto.supported === 0 && fundWide.supportedOverride === null && !(await prisma.sponsorImpact.findFirst({ where: { supportedOverride: { gt: 0 } } }))) {
    return { ok: false, sent: 0, failed: 0, error: "No students have been placed from the fund yet." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let sent = 0;
  let failed = 0;
  for (const [id, sp] of Array.from(bySponsor.entries())) {
    try {
      // Each sponsor gets their own figures (their overrides, then fund-wide, then automatic).
      const fund = await getFundImpact(id, { auto, fundWide });
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

/** When the last impact update went out, if ever. */
export async function lastImpactUpdateAt(): Promise<Date | null> {
  const row = await prisma.notification.findFirst({
    where: { title: "Your impact update" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  return row?.createdAt ?? null;
}
