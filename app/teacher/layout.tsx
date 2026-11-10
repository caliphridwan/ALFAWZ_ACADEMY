import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { TeacherNav } from "@/components/teacher/teacher-nav";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  // Never trust middleware alone — re-check the session and role here too.
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/teacher");
  if (session.user.role !== "TEACHER") redirect("/unauthorized");

  // Work waiting on this teacher, in their own courses only.
  const own = { course: { instructor: { is: { userId: session.user.id } } } };
  const [recitationsToReview, assessmentsToMark] = await Promise.all([
    prisma.recitationSubmission.count({ where: { reviewedAt: null, task: own } }),
    prisma.assessmentAttempt.count({
      where: { needsMarking: true, status: { not: "IN_PROGRESS" }, assessment: own },
    }),
  ]);

  return (
    <div className="container py-8">
      <TeacherNav
        name={session.user.name ?? "Teacher"}
        recitationsToReview={recitationsToReview}
        assessmentsToMark={assessmentsToMark}
      />
      {children}
    </div>
  );
}
