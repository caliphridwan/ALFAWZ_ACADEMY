import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/cn";

export default async function SponsorDashboardPage() {
  const session = await getServerSession(authOptions);
  const sponsorId = session!.user.id;

  const sponsorships = await prisma.sponsorship.findMany({
    where: { sponsorId },
    orderBy: { createdAt: "desc" },
  });

  const activeSponsorships = sponsorships.filter((s) => s.status === "ACTIVE");
  const totalStudentsSupported = activeSponsorships.reduce((sum, s) => sum + s.numberOfStudents, 0);
  const totalContributed = sponsorships
    .filter((s) => s.status === "ACTIVE")
    .reduce((sum, s) => sum + Number(s.totalAmount), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">
        Assalamu Alaikum, {session!.user.name?.split(" ")[0]}
      </h1>
      <p className="text-muted-foreground mb-8">
        Your generosity is making Islamic education accessible. Jazakumullahu khairan.
      </p>

      <div className="rounded-xl bg-brand text-brand-foreground p-8 mb-10">
        <p className="text-sm uppercase tracking-wide opacity-80 mb-2">Your Impact</p>
        <p className="text-4xl font-bold mb-1">
          You are currently supporting {totalStudentsSupported} Student
          {totalStudentsSupported !== 1 ? "s" : ""}
        </p>
        <p className="opacity-80 text-sm mt-2">
          Your sponsorship has helped make Islamic education accessible to
          students who might not otherwise have had the opportunity.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold text-brand">{activeSponsorships.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Active Sponsorships</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold text-brand">{formatCurrency(totalContributed)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Contributed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold text-brand">{sponsorships.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Sponsorships (all time)</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-lg font-semibold mb-4">Sponsorship History</h2>
      <div className="space-y-3">
        {sponsorships.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {s.numberOfStudents} Student{s.numberOfStudents > 1 ? "s" : ""} · {s.duration}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(Number(s.totalAmount), s.currency)} · {s.status}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(s.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
