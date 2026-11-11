import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { ResultsView } from "@/components/assessments/results-view";

export const dynamic = "force-dynamic";

export default async function TeacherResultsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const course = await prisma.course.findFirst({
    where: { id: params.id, instructor: { is: { userId: session!.user.id } } },
    select: { id: true, title: true },
  });
  if (!course) notFound();

  return (
    <div>
      <Link href={`/teacher/courses/${course.id}/assessments`} className="text-sm text-muted-foreground hover:text-foreground">
        ← Assessments
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Results — {course.title}</h1>
      <ResultsView courseId={course.id} slipBase={`/teacher/courses/${course.id}/assessments/slip`} />
    </div>
  );
}
