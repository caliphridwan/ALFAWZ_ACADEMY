import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SessionForm } from "@/components/admin/session-form";
import { SessionRowControls } from "@/components/admin/session-row-controls";
import { RecordingControl } from "@/components/admin/recording-control";
import { formatAcademyDateTime } from "@/lib/utils/datetime";

export const dynamic = "force-dynamic";

export default async function CourseSessionsPage({ params }: { params: { id: string } }) {
  const [course, sessions, enrolledCount] = await Promise.all([
    prisma.course.findUnique({ where: { id: params.id }, select: { id: true, title: true, schedule: true } }),
    prisma.classSession.findMany({
      where: { courseId: params.id },
      orderBy: { startsAt: "asc" },
      include: { _count: { select: { attendance: true } } },
    }),
    prisma.enrollment.count({
      where: { courseId: params.id, status: { in: ["ACTIVE", "COMPLETED"] } },
    }),
  ]);

  if (!course) notFound();

  const now = Date.now();
  const upcoming = sessions.filter((s) => s.startsAt.getTime() + s.durationMinutes * 60000 >= now);
  const past = sessions.filter((s) => s.startsAt.getTime() + s.durationMinutes * 60000 < now).reverse();

  function renderTable(rows: typeof sessions, empty: string) {
    return (
      <Card className="mb-8">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr>
                <th className="p-4">When (WAT)</th>
                <th className="p-4">Length</th>
                <th className="p-4">Status</th>
                <th className="p-4">Attendance</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 align-top">
                  <td className="p-4">
                    <p className="font-medium">{formatAcademyDateTime(s.startsAt)}</p>
                    {s.topic && <p className="text-xs text-muted-foreground">{s.topic}</p>}
                  </td>
                  <td className="p-4 whitespace-nowrap">{s.durationMinutes} min</td>
                  <td className="p-4">
                    {s.cancelled ? (
                      <Badge variant="muted">Cancelled</Badge>
                    ) : s.reminderSentAt ? (
                      <Badge variant="default">Reminder sent</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Scheduled</span>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground whitespace-nowrap">
                    {s._count.attendance}/{enrolledCount} marked
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/courses/${course!.id}/sessions/${s.id}`}>Attendance</Link>
                      </Button>
                      <RecordingControl sessionId={s.id} initialUrl={s.recordingUrl} />
                      <SessionRowControls sessionId={s.id} cancelled={s.cancelled} />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    {empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl">
      <Link href="/admin/courses" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to courses
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-1">Class sessions — {course.title}</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        Scheduled classes appear on each enrolled student&apos;s schedule, trigger a reminder email about
        an hour before they start, and are what attendance and progress are measured against.
        {course.schedule && <> Current free-text schedule: <em>{course.schedule}</em>.</>}
      </p>

      <h2 className="font-semibold mb-3">Schedule a class</h2>
      <Card className="mb-8">
        <CardContent className="p-5">
          <SessionForm courseId={course.id} />
        </CardContent>
      </Card>

      <h2 className="font-semibold mb-3">Upcoming</h2>
      {renderTable(upcoming, "No upcoming classes scheduled.")}

      <h2 className="font-semibold mb-3">Past</h2>
      {renderTable(past, "No past classes yet.")}
    </div>
  );
}
