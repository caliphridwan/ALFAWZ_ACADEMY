import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/cn";
import { getFundImpact, MIN_GROUP } from "@/lib/sponsor-impact";

export const dynamic = "force-dynamic";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default async function SponsorImpactPage() {
  const session = await getServerSession(authOptions);
  const [sponsorships, fund] = await Promise.all([
    prisma.sponsorship.findMany({
      where: { sponsorId: session!.user.id },
      orderBy: { createdAt: "desc" },
    }),
    getFundImpact(),
  ]);

  const active = sponsorships.filter((s) => s.status === "ACTIVE");
  const myPlaces = active.reduce((sum, s) => sum + s.numberOfStudents, 0);
  const sharePct = fund.fundedPlaces > 0 ? Math.round((myPlaces / fund.fundedPlaces) * 100) : 0;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">My Sponsorship</h1>

      <div className="rounded-xl bg-brand text-brand-foreground p-8 mb-8">
        <p className="text-sm uppercase tracking-wide opacity-80 mb-2">Your contribution</p>
        <p className="text-4xl font-bold mb-1">
          {myPlaces} {myPlaces === 1 ? "place" : "places"} funded
        </p>
        <p className="opacity-80 text-sm mt-2">
          Across {active.length} active sponsorship{active.length !== 1 ? "s" : ""}
          {myPlaces > 0 && fund.fundedPlaces > 0 ? `, ${sharePct}% of the places the fund pays for.` : "."}
        </p>
      </div>

      <h2 className="font-semibold mb-1">What the fund is doing</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Sponsors give into one pooled fund, and the Academy chooses the students who receive places. To protect the children, we share
        group figures only, never individual names or results.
      </p>

      {fund.supported === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No students have been placed from the fund yet. Updates will appear here as soon as they are.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Students supported now" value={String(fund.supported)} hint={`${fund.fundedPlaces} places funded by all sponsors`} />
            <Stat label="Courses completed" value={fund.completedSmall ? `Fewer than ${MIN_GROUP}` : String(fund.completed)} />
            {fund.attendancePct !== null && <Stat label="Average class attendance" value={`${fund.attendancePct}%`} />}
            {fund.recitationAvg !== null && <Stat label="Average recitation rating" value={`${fund.recitationAvg} / 5`} hint="Rated by teachers" />}
            {fund.passRatePct !== null && (
              <Stat label="Passed their assessments" value={`${fund.passRatePct}%`} hint={`${fund.passedCount} of ${fund.assessedCount} results`} />
            )}
            {fund.certificates !== null && <Stat label="Certificates earned" value={String(fund.certificates)} />}
          </div>

          {fund.note && (
            <Card>
              <CardContent className="p-5 text-sm whitespace-pre-line">{fund.note}</CardContent>
            </Card>
          )}

          {!fund.detailed && (
            <p className="text-xs text-muted-foreground">
              Attendance, ratings and results appear once at least {MIN_GROUP} students are supported, so no individual child can be identified.
            </p>
          )}

          <div>
            <h3 className="mb-2 font-medium">Where they are studying</h3>
            <div className="flex flex-wrap gap-2">
              {fund.byLevel.map((l) => (
                <Badge key={l.level} variant="muted">
                  {l.level}: {l.small ? `fewer than ${MIN_GROUP}` : l.count}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      <h2 className="font-semibold mt-10 mb-3">All Sponsorships</h2>
      <div className="space-y-3">
        {sponsorships.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {s.numberOfStudents} Student{s.numberOfStudents > 1 ? "s" : ""} · {s.duration}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(Number(s.totalAmount), s.currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Started {new Date(s.createdAt).toLocaleDateString()}
                  {s.expiresAt ? ` · Renews ${new Date(s.expiresAt).toLocaleDateString()}` : ""}
                </p>
              </div>
              <Badge variant={s.status === "ACTIVE" ? "default" : "muted"}>{s.status}</Badge>
            </CardContent>
          </Card>
        ))}
        {sponsorships.length === 0 && (
          <p className="text-muted-foreground text-sm">You haven&apos;t sponsored any students yet.</p>
        )}
      </div>
    </div>
  );
}
