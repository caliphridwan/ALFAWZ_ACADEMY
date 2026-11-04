import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { AttendanceForm } from "@/components/admin/attendance-form";
import { formatAcademyDateTime } from "@/lib/utils/datetime";

export const dynamic = "force-dynamic";

export default async function SessionAttendancePage({
  params,
}: {
  params: { id: string; sessionId: string };
}) {
  const session = await prisma.classSession.findUnique({
    where: { id: params.sessionId },
    include: { course: { select: { id: true, title: true } }, attendance: true },
  });

  if (!session || session.course.id !== params.id) notFound();

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: session.courseId, status: { in: ["ACTIVE", "COMPLETED"] } },
    include: { student: { select: { id: true, name: true } } },
    orderBy: { student: { name: "asc" } },
  });

  const byStudent = new Map(session.attendance.map((a) => [a.studentId, a.status]));
  const rows = enrollments.map((e) => ({
    studentId: e.student.id,
    name: e.student.name,
    current: byStudent.get(e.student.id) ?? null,
  }));

  return (
    <div className="max-w-2xl">
      <Link
        href={`/admin/courses/${session.course.id}/sessions`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to sessions
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-1">Attendance — {session.course.title}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {formatAcademyDateTime(session.startsAt)} · {session.durationMinutes} min
        {session.topic ? ` · ${session.topic}` : ""}
        {session.cancelled ? " · CANCELLED" : ""}
      </p>
      <Card>
        <CardContent className="p-5">
          <AttendanceForm sessionId={session.id} rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
