import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { RecitationManager } from "@/components/recitations/recitation-manager";

export const dynamic = "force-dynamic";

export default async function TeacherRecitationsPage({ params }: { params: { id: string } }) {
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
      <h1 className="text-2xl font-bold mt-2 mb-6">Recitations</h1>
      <RecitationManager courseId={course.id} />
    </div>
  );
}
