import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { AssessmentEditor } from "@/components/assessments/assessment-editor";

export const dynamic = "force-dynamic";

export default async function TeacherAssessmentPage({ params }: { params: { id: string; aid: string } }) {
  const session = await getServerSession(authOptions);
  const course = await prisma.course.findFirst({
    where: { id: params.id, instructor: { is: { userId: session!.user.id } } },
    select: { id: true, title: true },
  });
  if (!course) notFound();
  const assessment = await prisma.assessment.findFirst({ where: { id: params.aid, courseId: course.id }, select: { title: true } });
  if (!assessment) notFound();

  return (
    <div>
      <Link href={`/teacher/courses/${course.id}/assessments`} className="text-sm text-muted-foreground hover:text-foreground">
        ← All assessments
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">{assessment.title}</h1>
      <AssessmentEditor assessmentId={params.aid} courseId={course.id} base={`/teacher/courses/${course.id}`} />
    </div>
  );
}
