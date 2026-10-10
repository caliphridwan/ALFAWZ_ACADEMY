import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";

/**
 * Section 20/21: only ever selects columns safe to show publicly — no
 * email, phone, or payment amount is fetched here at all, not just hidden
 * in the UI. Shared by /sponsor (a short preview) and /sponsors (the full
 * list + impact stats) so both stay in sync on what's safe to display.
 */
export async function SponsorsList({
  limit,
  emptyState = true,
}: {
  limit?: number;
  emptyState?: boolean;
}) {
  const sponsorships = await prisma.sponsorship.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, publicName: true, showPublicly: true, numberOfStudents: true },
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });

  if (sponsorships.length === 0) {
    if (!emptyState) return null;
    return (
      <div className="text-center max-w-md mx-auto">
        <p className="text-muted-foreground mb-6">
          Be the first to sponsor a student and appear here.
        </p>
        <Button asChild>
          <Link href="/sponsor">Sponsor a Student</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
      {sponsorships.map((s) => (
        <div key={s.id} className="rounded-lg border border-border p-5 text-center">
          <p className={s.showPublicly ? "font-semibold" : "font-semibold text-muted-foreground"}>
            {s.showPublicly ? s.publicName : "Anonymous Sponsor"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Supporting {s.numberOfStudents} Student{s.numberOfStudents > 1 ? "s" : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
