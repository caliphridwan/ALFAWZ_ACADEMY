import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { totalUnreadChat } from "@/lib/chat";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Section 54: never trust client-side authorization / middleware alone —
  // every protected layout re-checks the session itself.
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");
  if (session.user.role !== "STUDENT") redirect("/unauthorized");

  // Session only carries id/role (Section: JWT keeps the token small) — the
  // profile photo lives on the full User record.
  const studentId = session.user.id;
  const now = new Date();
  const enrolledCourses = { enrollments: { some: { studentId, status: { in: ["ACTIVE", "COMPLETED"] as ("ACTIVE" | "COMPLETED")[] } } } };
  const [user, unreadNotifications, pendingRecitations, pendingAssessments, unreadChat] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, profileImage: true },
    }),
    prisma.notification.count({ where: { userId: session.user.id, read: false } }),
    // Recitation tasks in the student's courses that they haven't recorded yet.
    prisma.recitationTask.count({
      where: { course: enrolledCourses, submissions: { none: { studentId } } },
    }),
    // Published tests/exams that are open right now and not yet started.
    prisma.assessment.count({
      where: {
        course: enrolledCourses,
        status: "PUBLISHED",
        AND: [
          { OR: [{ opensAt: null }, { opensAt: { lte: now } }] },
          { OR: [{ closesAt: null }, { closesAt: { gte: now } }] },
        ],
        attempts: { none: { studentId } },
      },
    }),
    totalUnreadChat(studentId, "STUDENT").catch(() => 0),
  ]);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      <DashboardSidebar
        unreadNotifications={unreadNotifications}
        pendingRecitations={pendingRecitations}
        pendingAssessments={pendingAssessments}
        unreadChat={unreadChat}
      />
      <div className="flex-1 p-6 lg:p-10">
        <div className="flex justify-end mb-4">
          <Link
            href="/dashboard/profile"
            className="shrink-0"
            aria-label="Go to your profile"
          >
            {user?.profileImage ? (
              <Image
                src={user.profileImage}
                alt=""
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover border-4 border-border hover:border-brand transition-colors"
              />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-brand text-brand-foreground font-semibold text-3xl border-4 border-border hover:border-brand transition-colors">
                {user?.name?.trim()?.[0]?.toUpperCase() ?? "S"}
              </span>
            )}
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
