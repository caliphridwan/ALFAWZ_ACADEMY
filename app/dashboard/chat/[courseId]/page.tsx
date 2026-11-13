import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ChatPageBody } from "@/components/chat/chat-page";

export const dynamic = "force-dynamic";

export default async function StudentCourseChat({ params }: { params: { courseId: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.courseId }, select: { title: true } });
  if (!course) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/chat" className="text-sm text-muted-foreground hover:text-foreground">
        ← All course chats
      </Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">{course.title}</h1>
      <ChatPageBody courseId={params.courseId} />
    </div>
  );
}
