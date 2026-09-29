import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/cn";
import { RevenueChart } from "@/components/admin/revenue-chart";

export default async function AdminOverviewPage() {
  const [
    totalStudents,
    activeStudents,
    newStudentsThisMonth,
    totalCourses,
    activeCourses,
    totalEnrollments,
    successfulPayments,
    pendingPayments,
    failedPayments,
    revenueAgg,
    totalSponsors,
    studentsSponsoredAgg,
    activeSponsorships,
    sponsorshipFundsAgg,
    monthlyPayments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
    prisma.user.count({
      where: {
        role: "STUDENT",
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    prisma.course.count(),
    prisma.course.count({ where: { active: true } }),
    prisma.enrollment.count(),
    prisma.payment.count({ where: { status: "SUCCESSFUL" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "FAILED" } }),
    prisma.payment.aggregate({ where: { status: "SUCCESSFUL" }, _sum: { amount: true } }),
    prisma.sponsorship
      .findMany({ where: { status: "ACTIVE" }, select: { sponsorId: true }, distinct: ["sponsorId"] })
      .then((r) => r.length),
    prisma.sponsorship.aggregate({ where: { status: "ACTIVE" }, _sum: { numberOfStudents: true } }),
    prisma.sponsorship.count({ where: { status: "ACTIVE" } }),
    prisma.sponsorship.aggregate({ where: { status: "ACTIVE" }, _sum: { totalAmount: true } }),
    prisma.payment.findMany({
      where: { status: "SUCCESSFUL", paidAt: { not: null } },
      select: { amount: true, paidAt: true },
    }),
  ]);

  // Group successful payments by month for the revenue chart (Section 45).
  const monthly = new Map<string, number>();
  for (const p of monthlyPayments) {
    const key = p.paidAt!.toLocaleString("en-US", { month: "short", year: "2-digit" });
    monthly.set(key, (monthly.get(key) ?? 0) + Number(p.amount));
  }
  const chartData = Array.from(monthly.entries()).map(([month, revenue]) => ({ month, revenue }));

  const sections = [
    {
      title: "Students",
      stats: [
        { label: "Total Students", value: totalStudents },
        { label: "Active Students", value: activeStudents },
        { label: "New This Month", value: newStudentsThisMonth },
      ],
    },
    {
      title: "Courses",
      stats: [
        { label: "Total Courses", value: totalCourses },
        { label: "Active Courses", value: activeCourses },
        { label: "Total Enrollments", value: totalEnrollments },
      ],
    },
    {
      title: "Payments",
      stats: [
        { label: "Successful", value: successfulPayments },
        { label: "Pending", value: pendingPayments },
        { label: "Failed", value: failedPayments },
        { label: "Total Revenue", value: formatCurrency(Number(revenueAgg._sum.amount ?? 0)) },
      ],
    },
    {
      title: "Sponsorship",
      stats: [
        { label: "Total Sponsors", value: totalSponsors },
        { label: "Students Sponsored", value: studentsSponsoredAgg._sum.numberOfStudents ?? 0 },
        { label: "Active Sponsorships", value: activeSponsorships },
        {
          label: "Total Sponsorship Funds",
          value: formatCurrency(Number(sponsorshipFundsAgg._sum.totalAmount ?? 0)),
        },
      ],
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Admin Overview</h1>

      <div className="space-y-8 mb-10">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {section.title}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {section.stats.map((s) => (
                <Card key={s.label}>
                  <CardContent className="p-5">
                    <p className="text-2xl font-bold text-brand">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Monthly Revenue
          </h2>
          <RevenueChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
