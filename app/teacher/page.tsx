import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAcademyDateTime } from "@/lib/utils/datetime";

export const dynamic = "force-dynamic";

export default async function TeacherHomePage() {
  const session = await getServerSession(authOptions);
  const courses = await prisma.course.findMany({
    where: { active: true, instructor: { is: { userId: session!.user.id } } },
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      _count: { select: { enrollments: { where: { status: "ACTIVE" } } } },
      sessions: {
        where: { startsAt: { gte: new Date() }, cancelled: false },
        orderBy: { startsAt: "asc" },
        take: 1,
        select: { startsAt: true, topic: true },
      },
    },
  });

  const courseIds = courses.map((c) => c.id);
  const toReview = courseIds.length
    ? await prisma.recitationSubmission.count({
        where: { reviewedAt: null, task: { courseId: { in: courseIds } } },
      })
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">My courses</h1>
      {toReview > 0 && (
        <p className="mb-6 text-sm">
          <Badge variant="gold">{toReview} recitation{toReview === 1 ? "" : "s"} waiting for your feedback</Badge>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-5 space-y-3">
              <div>
                <p className="font-semibold">{c.title}</p>
                <p className="text-sm text-muted-foreground">{c._count.enrollments} active students</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {c.sessions[0]
                  ? `Next class: ${formatAcademyDateTime(c.sessions[0].startsAt)} (WAT)${c.sessions[0].topic ? ` · ${c.sessions[0].topic}` : ""}`
                  : "No upcoming class scheduled"}
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link href={`/teacher/courses/${c.id}`}>Classes &amp; attendance</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/teacher/courses/${c.id}/recitations`}>Recitations</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {courses.length === 0 && (
          <Card className="sm:col-span-2">
            <CardContent className="p-8 text-center text-muted-foreground">
              No courses are assigned to you yet. Ask the admin to set you as the instructor of your course.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
