import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/cn";

export default async function DashboardOverviewPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [enrollments, payments] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId: userId },
      include: { course: { include: { instructor: true } } },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.payment.findMany({ where: { userId } }),
  ]);

  const active = enrollments.filter((e) => e.status === "ACTIVE");
  const completed = enrollments.filter((e) => e.status === "COMPLETED");
  const pendingPayments = payments.filter((p) => p.status === "PENDING");
  const totalPaid = payments
    .filter((p) => p.status === "SUCCESSFUL")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const cards = [
    { label: "Active Courses", value: active.length },
    { label: "Completed Courses", value: completed.length },
    { label: "Pending Payments", value: pendingPayments.length },
    { label: "Total Paid", value: formatCurrency(totalPaid) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">
        Assalamu Alaikum, {session!.user.name?.split(" ")[0]}
      </h1>
      <p className="text-muted-foreground mb-8">Here&apos;s where your learning stands today.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <p className="text-2xl font-bold text-brand">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">My Courses</h2>
      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">You haven&apos;t enrolled in any courses yet.</p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {enrollments.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{e.course.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {e.course.instructor?.name ?? "Instructor TBA"} · {e.status}
                  </p>
                </div>
                <Button asChild size="sm" variant={e.status === "ACTIVE" ? "default" : "outline"}>
                  <Link href={`/courses/${e.course.slug}`}>
                    {e.status === "ACTIVE" ? "Continue Learning" : "View Course"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
