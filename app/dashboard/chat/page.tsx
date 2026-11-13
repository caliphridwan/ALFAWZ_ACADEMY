import Link from "next/link";
import { getServerSession } from "next-auth";
import { MessageCircle } from "lucide-react";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { unreadChatCounts } from "@/lib/chat";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ChatListPage() {
  const session = await getServerSession(authOptions);
  const studentId = session!.user.id;
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, status: { in: ["ACTIVE", "COMPLETED"] } },
    select: { course: { select: { id: true, title: true } } },
  });
  const unread = await unreadChatCounts(studentId, "STUDENT");

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold">Course Chat</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        A group chat for each course you&apos;re enrolled in. Ask questions, share voice notes and talk with your
        classmates and teacher.
      </p>
      <div className="space-y-3">
        {enrollments.map(({ course }) => {
          const n = unread.get(course.id) ?? 0;
          return (
            <Link key={course.id} href={`/dashboard/chat/${course.id}`} className="block">
              <Card className="transition-colors hover:border-brand">
                <CardContent className="flex items-center gap-3 p-4">
                  <MessageCircle className="text-brand" size={20} />
                  <span className="flex-1 font-medium">{course.title}</span>
                  {n > 0 && (
                    <span
                      className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-xs font-semibold leading-none text-destructive-foreground"
                      aria-label={`${n} unread messages`}
                    >
                      {n > 99 ? "99+" : n}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {enrollments.length === 0 && (
          <p className="text-sm text-muted-foreground">Enrol in a course to join its chat.</p>
        )}
      </div>
    </div>
  );
}
