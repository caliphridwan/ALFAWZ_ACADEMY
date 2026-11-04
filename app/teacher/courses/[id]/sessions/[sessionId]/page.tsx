import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { AttendanceForm } from "@/components/admin/attendance-form";
import { formatAcademyDateTime } from "@/lib/utils/datetime";

export const dynamic = "force-dynamic";

export default async function TeacherAttendancePage({
  params,
}: {
  params: { id: string; sessionId: string };
}) {
  const auth = await getServerSession(authOptions);
  const session = await prisma.classSession.findFirst({
    where: {
      id: params.sessionId,
      courseId: params.id,
      course: { instructor: { is: { userId: auth!.user.id } } },
    },
    include: { course: { select: { id: true, title: true } }, attendance: true },
  });
  if (!session) notFound();

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
        href={`/teacher/courses/${session.course.id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to classes
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-1">Attendance — {session.course.title}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {formatAcademyDateTime(session.startsAt)} · {session.durationMinutes} min
        {session.topic ? ` · ${session.topic}` : ""}
      </p>
      <Card>
        <CardContent className="p-5">
          <AttendanceForm sessionId={session.id} rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
