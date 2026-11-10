import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AssessmentEditor } from "@/components/assessments/assessment-editor";

export const dynamic = "force-dynamic";

export default async function AdminAssessmentPage({ params }: { params: { id: string; aid: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { id: true, title: true } });
  if (!course) notFound();
  const assessment = await prisma.assessment.findFirst({ where: { id: params.aid, courseId: course.id }, select: { title: true } });
  if (!assessment) notFound();

  return (
    <div>
      <Link href={`/admin/courses/${course.id}/assessments`} className="text-sm text-muted-foreground hover:text-foreground">
        ← All assessments for {course.title}
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">{assessment.title}</h1>
      <AssessmentEditor assessmentId={params.aid} courseId={course.id} base={`/admin/courses/${course.id}`} />
    </div>
  );
}
