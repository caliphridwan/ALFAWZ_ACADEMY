import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Video } from "lucide-react";
import { formatAcademyDateTime } from "@/lib/utils/datetime";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const session = await getServerSession(authOptions);
  const active = await prisma.enrollment.findMany({
    where: { studentId: session!.user.id, status: "ACTIVE" },
    include: { course: { include: { instructor: true } } },
  });

  const courseIds = active.map((e) => e.courseId);
  const now = new Date();

  // Anything that hasn't finished yet (so a class that's running right now
  // still shows, with its Join button).
  const sessions = courseIds.length
    ? await prisma.classSession.findMany({
        where: {
          courseId: { in: courseIds },
          startsAt: { gte: new Date(now.getTime() - 3 * 60 * 60 * 1000) },
        },
        orderBy: { startsAt: "asc" },
        take: 60,
      })
    : [];

  const upcoming = sessions.filter(
    (s) => s.startsAt.getTime() + s.durationMinutes * 60000 >= now.getTime()
  );
  const courseById = new Map<string, (typeof active)[number]["course"]>(
    active.map((e) => [e.courseId, e.course] as const)
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Schedule</h1>

      {active.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              You have no active courses yet — your class schedule will appear here once enrolled.
            </p>
            <Button asChild size="sm">
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <h2 className="font-semibold mb-3">Upcoming classes</h2>
          <div className="space-y-3 mb-10">
            {upcoming.map((s) => {
              const course = courseById.get(s.courseId);
              const zoom = s.zoomLink || course?.zoomLink;
              return (
                <Card key={s.id}>
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{course?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatAcademyDateTime(s.startsAt)} (WAT) · {s.durationMinutes} min
                      </p>
                      {s.topic && <p className="text-sm mt-1">{s.topic}</p>}
                      {s.cancelled && (
                        <Badge variant="muted" className="mt-2">
                          Cancelled
                        </Badge>
                      )}
                    </div>
                    {!s.cancelled && zoom && (
                      <Button asChild size="sm">
                        <a href={zoom} target="_blank" rel="noopener noreferrer">
                          <Video size={16} className="mr-1" />
                          Join Class
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {upcoming.length === 0 && (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No classes have been scheduled yet. You&apos;ll get an email and a notification as soon as
                  your teacher adds one.
                </CardContent>
              </Card>
            )}
          </div>

          <h2 className="font-semibold mb-3">Your courses</h2>
          <div className="space-y-3">
            {active.map((e) => (
              <Card key={e.id}>
                <CardContent className="p-5">
                  <p className="font-medium">{e.course.title}</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {e.course.instructor?.name ?? "Instructor to be announced"}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays size={16} className="text-brand shrink-0" />
                    {e.course.schedule ? (
                      <span>{e.course.schedule}</span>
                    ) : (
                      <span className="text-muted-foreground">
                        Class time not yet set —{" "}
                        <Link href="/contact" className="text-brand hover:underline">
                          contact us
                        </Link>{" "}
                        to confirm.
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
