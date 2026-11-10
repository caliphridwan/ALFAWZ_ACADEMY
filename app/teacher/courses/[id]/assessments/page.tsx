import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { AssessmentsHome } from "@/components/assessments/assessments-home";

export const dynamic = "force-dynamic";

export default async function TeacherAssessmentsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const course = await prisma.course.findFirst({
    where: { id: params.id, instructor: { is: { userId: session!.user.id } } },
    select: { id: true, title: true },
  });
  if (!course) notFound();

  return (
    <div>
      <Link href={`/teacher/courses/${course.id}`} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to {course.title}
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Assessments</h1>
      <AssessmentsHome courseId={course.id} base={`/teacher/courses/${course.id}`} />
    </div>
  );
}
