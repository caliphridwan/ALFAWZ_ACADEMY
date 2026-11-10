import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AssessmentsHome } from "@/components/assessments/assessments-home";

export const dynamic = "force-dynamic";

export default async function AdminAssessmentsPage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { id: true, title: true } });
  if (!course) notFound();

  return (
    <div>
      <Link href="/admin/courses" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to courses
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Assessments — {course.title}</h1>
      <AssessmentsHome courseId={course.id} base={`/admin/courses/${course.id}`} />
    </div>
  );
}
