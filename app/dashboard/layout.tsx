import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Section 54: never trust client-side authorization / middleware alone —
  // every protected layout re-checks the session itself.
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");
  if (session.user.role !== "STUDENT") redirect("/unauthorized");

  // Session only carries id/role (Section: JWT keeps the token small) — the
  // profile photo lives on the full User record.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, profileImage: true },
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      <DashboardSidebar />
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
