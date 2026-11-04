import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/cn";
import { formatAcademyDate } from "@/lib/utils/datetime";
import { NudgeButton } from "@/components/admin/nudge-button";

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;

function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
}

function Tile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
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

export default async function AdminReportsPage() {
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * DAY);
  const since90 = new Date(now.getTime() - 90 * DAY);
  const since6m = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

  const [activeStudents, newEnrolments30, pendingClaims, pendingScholarships, payments, enrolments, courses, activeEnrolments, attendance] =
    await Promise.all([
      prisma.user.count({
        where: { role: "STUDENT", isActive: true, enrollments: { some: { status: "ACTIVE" } } },
      }),
      prisma.enrollment.count({
        where: { enrolledAt: { gte: since30 }, status: { in: ["ACTIVE", "COMPLETED"] } },
      }),
      prisma.bankTransferClaim.count({ where: { status: "PENDING" } }),
      prisma.scholarshipApplication.count({ where: { status: "PENDING" } }),
      prisma.payment.findMany({
        where: { status: "SUCCESSFUL", paidAt: { gte: since6m } },
        select: { amount: true, currency: true, paidAt: true },
      }),
      prisma.enrollment.findMany({
        where: { enrolledAt: { gte: since6m }, status: { in: ["ACTIVE", "COMPLETED"] } },
        select: { enrolledAt: true },
      }),
      prisma.course.findMany({
        where: { active: true },
        orderBy: { title: "asc" },
        select: { id: true, title: true },
      }),
      prisma.enrollment.findMany({
        where: { status: "ACTIVE", student: { isActive: true } },
        select: {
          studentId: true,
          courseId: true,
          student: { select: { name: true, email: true } },
          course: { select: { title: true } },
        },
      }),
      prisma.attendance.findMany({
        where: { session: { startsAt: { gte: since90, lte: now }, cancelled: false } },
        select: { status: true, studentId: true, session: { select: { courseId: true, startsAt: true } } },
        take: 20000,
      }),
    ]);

  // ---- Revenue (last 30 days, per currency) and the 6-month trend ----
  const revenue30 = new Map<string, number>();
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) months.push(monthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))));
  const monthRevenue = new Map<string, Map<string, number>>(months.map((m) => [m, new Map()]));
  const monthEnrol = new Map<string, number>(months.map((m) => [m, 0]));

  for (const p of payments) {
    if (!p.paidAt) continue;
    const amount = Number(p.amount);
    if (p.paidAt >= since30) revenue30.set(p.currency, (revenue30.get(p.currency) ?? 0) + amount);
    const bucket = monthRevenue.get(monthKey(p.paidAt));
    if (bucket) bucket.set(p.currency, (bucket.get(p.currency) ?? 0) + amount);
  }
  for (const e of enrolments) {
    const k = monthKey(e.enrolledAt);
    if (monthEnrol.has(k)) monthEnrol.set(k, (monthEnrol.get(k) ?? 0) + 1);
  }
  const money = (m: Map<string, number>) =>
    m.size === 0 ? "—" : Array.from(m.entries()).map(([cur, amt]) => formatCurrency(amt, cur)).join(" + ");

  // ---- Attendance rate per course, and at-risk students ----
  const rate = new Map<string, { present: number; absent: number }>();
  const byPair = new Map<string, { status: string; at: Date }[]>();
  for (const a of attendance) {
    const r = rate.get(a.session.courseId) ?? { present: 0, absent: 0 };
    if (a.status === "PRESENT") r.present += 1;
    else if (a.status === "ABSENT") r.absent += 1;
    rate.set(a.session.courseId, r);

    const key = `${a.studentId}|${a.session.courseId}`;
    const list = byPair.get(key) ?? [];
    list.push({ status: a.status, at: a.session.startsAt });
    byPair.set(key, list);
  }

  const atRisk = activeEnrolments
    .map((e) => {
      const marks = (byPair.get(`${e.studentId}|${e.courseId}`) ?? []).sort((x, y) => y.at.getTime() - x.at.getTime());
      let streak = 0;
      for (const m of marks) {
        if (m.status === "ABSENT") streak += 1;
        else break;
      }
      const lastPresent = marks.find((m) => m.status === "PRESENT")?.at ?? null;
      return { ...e, streak, lastPresent };
    })
    .filter((e) => e.streak >= 2)
    .sort((a, b) => b.streak - a.streak);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <Tile label="Active students" value={activeStudents} />
        <Tile label="New enrolments (30 days)" value={newEnrolments30} />
        <Tile label="Revenue (30 days)" value={money(revenue30)} />
        <Tile
          label="Waiting for review"
          value={pendingClaims + pendingScholarships}
          hint={`${pendingClaims} bank transfers · ${pendingScholarships} scholarships`}
        />
      </div>

      <h2 className="font-semibold mb-3">Last 6 months</h2>
      <Card className="mb-10 max-w-3xl">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr>
                <th className="p-4">Month</th>
                <th className="p-4">New enrolments</th>
                <th className="p-4">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium">{monthLabel(m)}</td>
                  <td className="p-4">{monthEnrol.get(m)}</td>
                  <td className="p-4">{money(monthRevenue.get(m)!)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <h2 className="font-semibold mb-3">Attendance by course (last 90 days)</h2>
      <Card className="mb-10 max-w-3xl">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr>
                <th className="p-4">Course</th>
                <th className="p-4">Students</th>
                <th className="p-4">Attendance rate</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => {
                const r = rate.get(c.id);
                const total = r ? r.present + r.absent : 0;
                const pct = total ? Math.round((r!.present / total) * 100) : null;
                const students = activeEnrolments.filter((e) => e.courseId === c.id).length;
                return (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium">{c.title}</td>
                    <td className="p-4">{students}</td>
                    <td className="p-4">
                      {pct === null ? (
                        <span className="text-muted-foreground">No attendance marked</span>
                      ) : (
                        <Badge variant={pct >= 75 ? "default" : pct >= 50 ? "gold" : "muted"}>{pct}%</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <h2 className="font-semibold mb-1">Students who may need a check-in</h2>
      <p className="text-sm text-muted-foreground mb-3">
        Active students marked absent for their last two or more classes in a course.
      </p>
      <Card className="max-w-3xl">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Missed in a row</th>
                <th className="p-4">Last attended</th>
                <th className="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {atRisk.map((e) => (
                <tr key={`${e.studentId}|${e.courseId}`} className="border-b border-border last:border-0">
                  <td className="p-4">
                    <p className="font-medium">{e.student.name}</p>
                    <p className="text-xs text-muted-foreground">{e.student.email}</p>
                  </td>
                  <td className="p-4">{e.course.title}</td>
                  <td className="p-4">
                    <Badge variant="gold">{e.streak}</Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {e.lastPresent ? formatAcademyDate(e.lastPresent) : "Not in the last 90 days"}
                  </td>
                  <td className="p-4 text-right">
                    <NudgeButton studentId={e.studentId} courseId={e.courseId} />
                  </td>
                </tr>
              ))}
              {atRisk.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    No one right now. Attendance is only counted for classes where you have marked it.
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
