import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/cn";
import { ArchiveCourseButton } from "@/components/admin/archive-course-button";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: { instructor: true, _count: { select: { enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Button asChild>
          <Link href="/admin/courses/new">Create Course</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Price</th>
                <th className="p-4">Enrollments</th>
                <th className="p-4">Status</th>
                <th className="p-4">Enrollment</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="p-4 font-medium">{c.title}</td>
                  <td className="p-4">{formatCurrency(Number(c.price), c.currency)}</td>
                  <td className="p-4">{c._count.enrollments}</td>
                  <td className="p-4">
                    <Badge variant={c.active ? "default" : "muted"}>{c.active ? "Active" : "Archived"}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={c.enrollmentOpen ? "gold" : "muted"}>
                      {c.enrollmentOpen ? "Open" : "Closed"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/courses/${c.id}/edit`}>Edit</Link>
                    </Button>
                    {c.active && <ArchiveCourseButton courseId={c.id} />}
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No courses yet — create your first one.
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
