import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function SponsorDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/sponsor/dashboard");
  if (session.user.role !== "SPONSOR") redirect("/unauthorized");

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      <DashboardSidebar variant="sponsor" />
      <div className="flex-1 p-6 lg:p-10">{children}</div>
    </div>
  );
}
