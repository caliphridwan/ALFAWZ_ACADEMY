import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { MarkingView } from "@/components/assessments/marking-view";

export const dynamic = "force-dynamic";

export default async function TeacherMarkingPage({ params }: { params: { id: string; aid: string } }) {
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
      <Link href={`/teacher/courses/${course.id}/assessments/${params.aid}`} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to the assessment
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Marking — {assessment.title}</h1>
      <MarkingView assessmentId={params.aid} courseId={course.id} />
    </div>
  );
}
