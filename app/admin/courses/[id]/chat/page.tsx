import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ChatPageBody } from "@/components/chat/chat-page";

export const dynamic = "force-dynamic";

export default async function AdminCourseChat({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { id: true, title: true } });
  if (!course) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/courses" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to courses
      </Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Chat — {course.title}</h1>
      <ChatPageBody courseId={course.id} />
    </div>
  );
}
