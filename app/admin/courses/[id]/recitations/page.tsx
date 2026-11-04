import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { RecitationManager } from "@/components/recitations/recitation-manager";

export const dynamic = "force-dynamic";

export default async function AdminCourseRecitationsPage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { id: true, title: true } });
  if (!course) notFound();

  return (
    <div>
      <Link href="/admin/courses" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to courses
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Recitations — {course.title}</h1>
      <RecitationManager courseId={course.id} />
    </div>
  );
}
