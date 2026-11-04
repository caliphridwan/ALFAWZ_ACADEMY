import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { TeacherNav } from "@/components/teacher/teacher-nav";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  // Never trust middleware alone — re-check the session and role here too.
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/teacher");
  if (session.user.role !== "TEACHER") redirect("/unauthorized");

  return (
    <div className="container py-8">
      <TeacherNav name={session.user.name ?? "Teacher"} />
      {children}
    </div>
  );
}
