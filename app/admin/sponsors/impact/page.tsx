import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAutoFundImpact, getImpactOverrides } from "@/lib/sponsor-impact";
import { ImpactSettingsForm } from "@/components/admin/impact-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminImpactPage() {
  const [auto, overrides, sponsorships] = await Promise.all([
    getAutoFundImpact(),
    getImpactOverrides(),
    prisma.sponsorship.findMany({
      where: { status: { in: ["ACTIVE", "PENDING"] } },
      select: { numberOfStudents: true, status: true, sponsor: { select: { id: true, name: true, email: true, sponsorImpact: { select: { id: true } } } } },
    }),
  ]);

  const sponsors = new Map<string, { id: string; name: string; email: string; places: number; custom: boolean }>();
  for (const s of sponsorships) {
    const cur = sponsors.get(s.sponsor.id);
    const places = s.status === "ACTIVE" ? s.numberOfStudents : 0;
    if (cur) cur.places += places;
    else sponsors.set(s.sponsor.id, { id: s.sponsor.id, name: s.sponsor.name, email: s.sponsor.email, places, custom: !!s.sponsor.sponsorImpact });
  }

  return (
    <div className="max-w-2xl space-y-10">
      <section>
        <h1 className="text-2xl font-bold mb-2">Impact figures for sponsors</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Edit each sponsor&apos;s own figures below. What you set here applies to every sponsor who has no figure of their own for that item.
        </p>
        <h2 className="font-semibold mb-3">Each sponsor</h2>
        <div className="space-y-2">
          {Array.from(sponsors.values()).map((sp) => (
            <Card key={sp.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{sp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {sp.email} · {sp.places} {sp.places === 1 ? "place" : "places"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {sp.custom && <Badge variant="gold">Customised</Badge>}
                  <Link href={`/admin/sponsors/impact/${sp.id}`} className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted">
                    Edit
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {sponsors.size === 0 && <p className="text-sm text-muted-foreground">No sponsors yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-1">Default for all sponsors</h2>
        <p className="text-sm text-muted-foreground mb-4">Leave a box empty to use the automatic figure (shown in grey). Type a number to replace it.</p>
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
      </section>
    </div>
  );
}
