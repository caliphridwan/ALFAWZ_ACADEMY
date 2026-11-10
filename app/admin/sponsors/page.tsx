import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/cn";
import { SendImpactButton } from "@/components/admin/send-impact-button";
import { SponsorshipRowControls } from "@/components/admin/sponsorship-row-controls";

export default async function AdminSponsorsPage() {
  const sponsorships = await prisma.sponsorship.findMany({
    include: { sponsor: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Sponsors &amp; Sponsorships</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/sponsors/impact" className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Edit impact figures
          </Link>
          <SendImpactButton />
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr>
                <th className="p-4">Sponsor</th>
                <th className="p-4">Students</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Recognition</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sponsorships.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/40 align-top">
                  <td className="p-4">
                    <p className="font-medium">{s.sponsor.name}</p>
                    <p className="text-xs text-muted-foreground">{s.sponsor.email}</p>
                  </td>
                  <td className="p-4">{s.numberOfStudents}</td>
                  <td className="p-4">{formatCurrency(Number(s.totalAmount), s.currency)}</td>
                  <td className="p-4">
                    <Badge variant={s.status === "ACTIVE" ? "default" : "muted"}>{s.status}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={s.showPublicly ? "gold" : "muted"}>
                      {s.showPublicly ? "Public" : "Anonymous"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <SponsorshipRowControls
                      sponsorshipId={s.id}
                      showPublicly={s.showPublicly}
                      publicName={s.publicName}
                      status={s.status}
                    />
                  </td>
                </tr>
              ))}
              {sponsorships.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No sponsorships recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
