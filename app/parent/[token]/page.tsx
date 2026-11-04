import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { ProgressSummary } from "@/components/dashboard/progress-summary";
import { getProgressForEnrollments } from "@/lib/progress-data";
import { formatAcademyDateTime } from "@/lib/utils/datetime";

export const dynamic = "force-dynamic";

// A private link: never indexed, never cached by search engines.
export const metadata: Metadata = {
  title: "Student Progress",
  robots: { index: false, follow: false },
};

export default async function ParentViewPage({ params }: { params: { token: string } }) {
  // Real tokens are 32 URL-safe characters; reject anything else outright.
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(params.token)) notFound();

  const student = await prisma.user.findUnique({
    where: { parentShareToken: params.token },
    select: {
      id: true,
      name: true,
      isActive: true,
      enrollments: {
        where: { status: { in: ["ACTIVE", "COMPLETED", "PENDING"] } },
        include: { course: { select: { id: true, title: true, duration: true } } },
        orderBy: { enrolledAt: "desc" },
      },
    },
  });

  if (!student || !student.isActive) notFound();

  const enrolled = student.enrollments.filter((e) => e.status !== "PENDING");
  const pending = student.enrollments.filter((e) => e.status === "PENDING");

  const progress = await getProgressForEnrollments(
    student.id,
    enrolled.map((e) => ({ id: e.id, courseId: e.courseId, enrolledAt: e.enrolledAt }))
  );

  const activeCourseIds = enrolled.filter((e) => e.status === "ACTIVE").map((e) => e.courseId);
  const upcoming = activeCourseIds.length
    ? await prisma.classSession.findMany({
        where: { courseId: { in: activeCourseIds }, cancelled: false, startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 5,
        select: { id: true, courseId: true, startsAt: true, durationMinutes: true, topic: true },
      })
    : [];
  const titleByCourse = new Map(enrolled.map((e) => [e.courseId, e.course.title]));

  return (
    <div className="container py-12 max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">AlFawz Academy · Parent view</p>
      <h1 className="text-2xl font-bold mb-1">{student.name}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        A read-only summary shared by the student. It updates automatically.
      </p>

      <h2 className="font-semibold mb-3">Courses</h2>
      <div className="space-y-3 mb-8">
        {enrolled.map((e) => (
          <div key={e.id} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{e.course.title}</p>
                <p className="text-xs text-muted-foreground">{e.course.duration}</p>
              </div>
              <Badge variant={e.status === "COMPLETED" ? "gold" : "default"}>
                {e.status === "COMPLETED" ? "Completed" : "In progress"}
              </Badge>
            </div>
            {progress.get(e.id) && <ProgressSummary progress={progress.get(e.id)!} />}
            {e.certificateNumber && (
              <a
                href={`/certificate/${e.certificateNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-brand hover:underline"
              >
                View certificate
              </a>
            )}
          </div>
        ))}
        {enrolled.length === 0 && (
          <p className="text-sm text-muted-foreground">Not enrolled in any course yet.</p>
        )}
      </div>

      {pending.length > 0 && (
        <div className="rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900 mb-8">
          Registration started but payment not yet completed for:{" "}
          {pending.map((e) => e.course.title).join(", ")}.
        </div>
      )}

      <h2 className="font-semibold mb-3">Upcoming classes</h2>
      <div className="space-y-2">
        {upcoming.map((s) => (
          <div key={s.id} className="rounded-lg border border-border p-4 text-sm">
            <p className="font-medium">{titleByCourse.get(s.courseId)}</p>
            <p className="text-muted-foreground">
              {formatAcademyDateTime(s.startsAt)} (WAT) · {s.durationMinutes} min
            </p>
            {s.topic && <p className="mt-1">{s.topic}</p>}
          </div>
        ))}
        {upcoming.length === 0 && (
          <p className="text-sm text-muted-foreground">No classes scheduled yet.</p>
        )}
      </div>
    </div>
  );
}
