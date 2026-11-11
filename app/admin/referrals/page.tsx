import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { referralLink } from "@/lib/referral-code";
import { ActiveToggle, CopyLinkButton, NewCampaignForm } from "@/components/admin/referral-controls";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://alfawzacademy.com";

  const [codes, totalStudents, referredStudents] = await Promise.all([
    prisma.referralCode.findMany({
      orderBy: [{ ownerId: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        code: true,
        label: true,
        active: true,
        clicks: true,
        ownerId: true,
        owner: { select: { name: true } },
        referredUsers: {
          select: { id: true, enrollments: { where: { status: { in: ["ACTIVE", "COMPLETED"] } }, select: { id: true }, take: 1 } },
        },
      },
    }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "STUDENT", referralCodeId: { not: null } } }),
  ]);

  const rows = codes.map((c) => ({
    ...c,
    signups: c.referredUsers.length,
    enrolled: c.referredUsers.filter((u) => u.enrollments.length > 0).length,
  }));
  const campaigns = rows.filter((r) => !r.ownerId);
  const students = rows.filter((r) => r.ownerId).sort((a, b) => b.signups - a.signups);

  const Table = ({ items, showOwner }: { items: typeof rows; showOwner?: boolean }) => (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr>
              <th className="p-4">{showOwner ? "Student" : "Name"}</th>
              <th className="p-4">Link</th>
              <th className="p-4">Visits</th>
              <th className="p-4">Signed up</th>
              <th className="p-4">Enrolled</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => {
              const link = referralLink(baseUrl, r.code);
              return (
                <tr key={r.id} className="border-b border-border last:border-0 align-top">
                  <td className="p-4">
                    <p className="font-medium">{showOwner ? r.owner?.name ?? r.label : r.label}</p>
                    {!r.active && <Badge variant="muted">Off</Badge>}
                  </td>
                  <td className="p-4 font-mono text-xs break-all">{link.replace(/^https?:\/\//, "")}</td>
                  <td className="p-4">{r.clicks}</td>
                  <td className="p-4">{r.signups}</td>
                  <td className="p-4">{r.enrolled}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <CopyLinkButton link={link} />
                      <ActiveToggle id={r.id} active={r.active} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Nothing here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-5xl space-y-10">
      <section>
        <h1 className="text-2xl font-bold mb-2">Referrals</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Make a separate link for each place you promote the academy (a WhatsApp group, a flyer, a mosque announcement). Anyone who opens
          it and registers within 30 days is credited to it. {referredStudents} of {totalStudents} students registered through a tracked link.
        </p>
        <Card>
          <CardContent className="p-5">
            <NewCampaignForm />
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Campaign links</h2>
        <Table items={campaigns} />
      </section>

      <section>
        <h2 className="font-semibold mb-3">Students&apos; invite links</h2>
        <Table items={students} showOwner />
      </section>
    </div>
  );
}
