import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { SponsorsList } from "@/components/sponsorship/sponsors-list";

export const metadata: Metadata = {
  title: "Our Sponsors",
  description:
    "Meet the generous individuals and organizations helping make Islamic education accessible to more students at AlFawz Academy.",
};

export default async function SponsorsPage() {
  const [distinctSponsorCount, activeCount, studentsSupported] = await Promise.all([
    prisma.sponsorship
      .findMany({ where: { status: "ACTIVE" }, select: { sponsorId: true }, distinct: ["sponsorId"] })
      .then((rows) => rows.length),
    prisma.sponsorship.count({ where: { status: "ACTIVE" } }),
    prisma.sponsorship
      .aggregate({ where: { status: "ACTIVE" }, _sum: { numberOfStudents: true } })
      .then((r) => r._sum.numberOfStudents ?? 0),
  ]);

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

      <SponsorsList />

      <p className="text-xs text-muted-foreground text-center mt-4">
        Impact statistics above are based on recorded platform data.
      </p>
    </div>
  );
}
