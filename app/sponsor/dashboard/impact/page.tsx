import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/cn";

export default async function SponsorImpactPage() {
  const session = await getServerSession(authOptions);
  const sponsorships = await prisma.sponsorship.findMany({
    where: { sponsorId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  const active = sponsorships.filter((s) => s.status === "ACTIVE");
  const totalStudents = active.reduce((sum, s) => sum + s.numberOfStudents, 0);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">My Sponsorship</h1>

      <div className="rounded-xl bg-brand text-brand-foreground p-8 mb-8">
        <p className="text-sm uppercase tracking-wide opacity-80 mb-2">Current Impact</p>
        <p className="text-4xl font-bold mb-1">
          {totalStudents} Student{totalStudents !== 1 ? "s" : ""} Supported
        </p>
        <p className="opacity-80 text-sm mt-2">
          Across {active.length} active sponsorship{active.length !== 1 ? "s" : ""}.
        </p>
      </div>

      <h2 className="font-semibold mb-3">All Sponsorships</h2>
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
