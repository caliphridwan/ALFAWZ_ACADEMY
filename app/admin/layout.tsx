import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Section 54/59: never trust middleware alone — every admin route re-checks
  // the session and role independently, server-side.
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/unauthorized");
  }

  // Things waiting for an admin decision, shown as counters on the menu.
  const [bankTransfers, scholarships, messages, alumni, recitationsToReview] = await Promise.all([
    prisma.bankTransferClaim.count({ where: { status: "PENDING" } }),
    prisma.scholarshipApplication.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.alumnus.count({ where: { status: "PENDING" } }),
    prisma.recitationSubmission.count({ where: { reviewedAt: null } }),
  ]);
  const counts = {
    "/admin/bank-transfers": bankTransfers,
    "/admin/scholarships": scholarships,
    "/admin/messages": messages,
    "/admin/alumni": alumni,
    "/admin/courses": recitationsToReview,
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      <AdminSidebar counts={counts} />
      <div className="flex-1 p-6 lg:p-10 overflow-x-auto">{children}</div>
    </div>
  );
}
