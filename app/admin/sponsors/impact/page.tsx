import { getAutoFundImpact, getImpactOverrides } from "@/lib/sponsor-impact";
import { ImpactSettingsForm } from "@/components/admin/impact-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminImpactPage() {
  const [auto, overrides] = await Promise.all([getAutoFundImpact(), getImpactOverrides()]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Impact figures for sponsors</h1>
      <p className="text-sm text-muted-foreground mb-6">
        These are the numbers sponsors see on their page and in the impact email. Leave a box empty to use the automatic figure
        (shown in grey). Type a number to replace it.
      </p>
      <ImpactSettingsForm
        overrides={overrides}
        auto={{
          supported: auto.supported,
          completed: auto.completed,
          certificates: auto.certificates,
          attendancePct: auto.attendancePct,
          recitationAvg: auto.recitationAvg,
          passRatePct: auto.passRatePct,
        }}
      />
    </div>
  );
}
