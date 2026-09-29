import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Our Sponsors",
  description:
    "Meet the generous individuals and organizations helping make Islamic education accessible to more students at AlFawz Academy.",
};

export default async function SponsorsPage() {
  // Only ever select the columns that are safe to show publicly. No email,
  // phone, or payment amount is fetched here at all (Section 21) — not just
  // hidden in the UI, genuinely excluded from the query.
  const [allActiveSponsorships, activeCount, distinctSponsorCount, studentsSupported] =
    await Promise.all([
      prisma.sponsorship.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, publicName: true, showPublicly: true, numberOfStudents: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.sponsorship.count({ where: { status: "ACTIVE" } }),
      prisma.sponsorship
        .findMany({ where: { status: "ACTIVE" }, select: { sponsorId: true }, distinct: ["sponsorId"] })
        .then((rows) => rows.length),
      prisma.sponsorship
        .aggregate({ where: { status: "ACTIVE" }, _sum: { numberOfStudents: true } })
        .then((r) => r._sum.numberOfStudents ?? 0),
    ]);

  const publicSponsorships = allActiveSponsorships.filter((s) => s.showPublicly);
  const anonymousSponsorships = allActiveSponsorships.filter((s) => !s.showPublicly);

  return (
    <div className="container py-16">
      <div className="max-w-2xl mx-auto text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Our Sponsors</h1>
        <p className="text-muted-foreground">
          Alhamdulillah, these generous individuals and organizations are
          helping make Islamic education accessible to more students.
        </p>
      </div>

      <div className="grid grid-cols-3 max-w-xl mx-auto text-center mb-14 rounded-xl border border-border p-6">
        <div>
          <p className="text-2xl font-bold text-brand">{studentsSupported}</p>
          <p className="text-xs text-muted-foreground mt-1">Students Currently Supported</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-brand">{distinctSponsorCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Sponsors</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-brand">{activeCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Active Sponsorships</p>
        </div>
      </div>

      {publicSponsorships.length === 0 && anonymousSponsorships.length === 0 ? (
        <div className="text-center max-w-md mx-auto">
          <p className="text-muted-foreground mb-6">
            Be the first to sponsor a student and appear here.
          </p>
          <Button asChild>
            <Link href="/sponsor">Sponsor a Student</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {publicSponsorships.map((s) => (
            <div key={s.id} className="rounded-lg border border-border p-5 text-center">
              <p className="font-semibold">{s.publicName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supporting {s.numberOfStudents} Student{s.numberOfStudents > 1 ? "s" : ""}
              </p>
            </div>
          ))}
          {anonymousSponsorships.map((s) => (
            <div key={s.id} className="rounded-lg border border-border p-5 text-center">
              <p className="font-semibold text-muted-foreground">Anonymous Sponsor</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supporting {s.numberOfStudents} Student{s.numberOfStudents > 1 ? "s" : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center mt-4">
        Impact statistics above are based on recorded platform data.
      </p>
    </div>
  );
}
