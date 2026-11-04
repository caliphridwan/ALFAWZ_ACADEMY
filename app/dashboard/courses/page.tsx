import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Award } from "lucide-react";
import { ProgressSummary } from "@/components/dashboard/progress-summary";
import { getProgressForEnrollments } from "@/lib/progress-data";

export default async function MyCoursesPage() {
  const session = await getServerSession(authOptions);
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session!.user.id },
    include: { course: { include: { instructor: true } } },
    orderBy: { enrolledAt: "desc" },
  });

  const progress = await getProgressForEnrollments(
    session!.user.id,
    enrollments
      .filter((e) => e.status === "ACTIVE" || e.status === "COMPLETED")
      .map((e) => ({ id: e.id, courseId: e.courseId, enrolledAt: e.enrolledAt }))
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>

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
                    {e.course.instructor?.name ?? "Instructor to be announced"} · {e.course.duration}
                  </p>
                  <Badge variant={e.status === "ACTIVE" ? "default" : "muted"} className="mt-2">
                    {e.status}
                  </Badge>
                  {progress.get(e.id) && <ProgressSummary progress={progress.get(e.id)!} />}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* ACTIVE is only ever reached after a verified Paystack payment
                      (see applyVerifiedPayment) — never shown otherwise. */}
                  {e.status === "ACTIVE" && e.course.zoomLink && (
                    <Button asChild size="sm">
                      <a href={e.course.zoomLink} target="_blank" rel="noopener noreferrer">
                        <Video size={16} className="mr-1" />
                        Join Class
                      </a>
                    </Button>
                  )}
                  {e.certificateNumber && (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/certificate/${e.certificateNumber}`} target="_blank">
                        <Award size={16} className="mr-1" />
                        Certificate
                      </Link>
                    </Button>
                  )}
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/courses/${e.course.slug}`}>View Course</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
