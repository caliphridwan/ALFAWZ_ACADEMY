import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { ChatPageBody } from "@/components/chat/chat-page";

export const dynamic = "force-dynamic";

export default async function TeacherCourseChat({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const course = await prisma.course.findFirst({
    where: { id: params.id, instructor: { is: { userId: session!.user.id } } },
    select: { id: true, title: true },
  });
  if (!course) notFound();
  return (
    <div className="max-w-3xl">
      <Link href={`/teacher/courses/${course.id}`} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to {course.title}
      </Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Chat — {course.title}</h1>
      <ChatPageBody courseId={course.id} />
    </div>
  );
}
