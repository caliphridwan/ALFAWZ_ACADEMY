import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Section 54: never trust client-side authorization / middleware alone —
  // every protected layout re-checks the session itself.
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");
  if (session.user.role !== "STUDENT") redirect("/unauthorized");

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      <DashboardSidebar />
      <div className="flex-1 p-6 lg:p-10">{children}</div>
    </div>
  );
}
