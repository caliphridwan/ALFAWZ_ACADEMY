import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecordingControl } from "@/components/admin/recording-control";
import { CountBadge } from "@/components/ui/count-badge";
import { pendingRecitationsByCourse } from "@/lib/recitations-pending";
import { unreadChatCounts } from "@/lib/chat";
import { formatAcademyDateTime } from "@/lib/utils/datetime";

export const dynamic = "force-dynamic";

export default async function TeacherCoursePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const course = await prisma.course.findFirst({
    where: { id: params.id, instructor: { is: { userId: session!.user.id } } },
    select: {
      id: true,
      title: true,
      sessions: {
        orderBy: { startsAt: "desc" },
        take: 40,
        include: { _count: { select: { attendance: true } } },
      },
    },
  });
  if (!course) notFound();

  const enrolled = await prisma.enrollment.count({
    where: { courseId: course.id, status: { in: ["ACTIVE", "COMPLETED"] } },
  });

  const toReview = (await pendingRecitationsByCourse([course.id])).get(course.id) ?? 0;
  const chatUnread = (await unreadChatCounts(session!.user.id, "TEACHER")).get(course.id) ?? 0;

  return (
    <div className="max-w-3xl">
      <Link href="/teacher" className="text-sm text-muted-foreground hover:text-foreground">
        ← My courses
      </Link>
      <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/teacher/courses/${course.id}/assessments`}>Assessments</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/teacher/courses/${course.id}/recitations`}>Recitations
              <CountBadge n={toReview} label="recitations to review" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/teacher/courses/${course.id}/chat`}>
              Chat
              {chatUnread > 0 && (
                <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-xs font-semibold leading-none text-destructive-foreground">
                  {chatUnread > 99 ? "99+" : chatUnread}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {course.sessions.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-medium">{formatAcademyDateTime(s.startsAt)} (WAT)</p>
                <p className="text-sm text-muted-foreground">
                  {s.durationMinutes} min{s.topic ? ` · ${s.topic}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Attendance: {s._count.attendance}/{enrolled} marked
                </p>
                {s.cancelled && (
                  <Badge variant="muted" className="mt-2">
                    Cancelled
                  </Badge>
                )}
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/teacher/courses/${course.id}/sessions/${s.id}`}>Attendance</Link>
                </Button>
                <RecordingControl sessionId={s.id} initialUrl={s.recordingUrl} />
              </div>
            </CardContent>
          </Card>
        ))}
        {course.sessions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No classes scheduled yet. The admin adds class times for this course.
          </p>
        )}
      </div>
    </div>
  );
}
