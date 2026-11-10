import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { applyOverrides, getAutoFundImpact, getImpactOverrides, getSponsorOverrides, mergeOverrides } from "@/lib/sponsor-impact";
import { SendImpactButton } from "@/components/admin/send-impact-button";
import { ImpactSettingsForm } from "@/components/admin/impact-settings-form";

export const dynamic = "force-dynamic";

export default async function SponsorImpactEditPage({ params }: { params: { sponsorId: string } }) {
  const sponsor = await prisma.user.findUnique({
    where: { id: params.sponsorId },
    select: { id: true, name: true, email: true },
  });
  if (!sponsor) notFound();

  const [auto, fundWide, own] = await Promise.all([getAutoFundImpact(), getImpactOverrides(), getSponsorOverrides(sponsor.id)]);
  // What this sponsor would see if their own boxes were empty.
  const inherited = applyOverrides(auto, mergeOverrides({ ...own, supportedOverride: null, completedOverride: null, certificatesOverride: null, attendanceOverride: null, recitationOverride: null, passRateOverride: null, note: null }, fundWide));

  return (
    <div className="max-w-2xl">
      <Link href="/admin/sponsors/impact" className="text-sm text-muted-foreground hover:underline">
        ← All sponsors
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-1">Impact figures for {sponsor.name}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Only {sponsor.name} will see these. Leave a box empty to use the default (grey). Their own places funded are always counted automatically.
      </p>
      <div className="mb-6">
        <SendImpactButton sponsorId={sponsor.id} sponsorName={sponsor.name} />
        <p className="mt-1 text-xs text-muted-foreground">Save your changes first, then send.</p>
      </div>
      <ImpactSettingsForm
        sponsorId={sponsor.id}
        baseLabel="Default"
        overrides={own}
        auto={{
          supported: inherited.supported,
          completed: inherited.completed,
          certificates: inherited.certificates,
          attendancePct: inherited.attendancePct,
          recitationAvg: inherited.recitationAvg,
          passRatePct: inherited.passRatePct,
        }}
      />
    </div>
  );
}
