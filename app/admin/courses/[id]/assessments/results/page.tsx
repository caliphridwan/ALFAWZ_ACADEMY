import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ResultsView } from "@/components/assessments/results-view";

export const dynamic = "force-dynamic";

export default async function AdminResultsPage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { id: true, title: true } });
  if (!course) notFound();

  return (
    <div>
      <Link href={`/admin/courses/${course.id}/assessments`} className="text-sm text-muted-foreground hover:text-foreground">
        ← Assessments
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Results — {course.title}</h1>
      <ResultsView courseId={course.id} />
    </div>
  );
}
