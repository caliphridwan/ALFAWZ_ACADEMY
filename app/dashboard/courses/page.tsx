import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function MyCoursesPage() {
  const session = await getServerSession(authOptions);
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session!.user.id },
    include: { course: { include: { instructor: true } } },
    orderBy: { enrolledAt: "desc" },
  });

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
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/courses/${e.course.slug}`}>View Course</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
