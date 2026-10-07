"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  CalendarDays,
  User,
  Bell,
  LifeBuoy,
  LogOut,
  HeartHandshake,
  Receipt,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STUDENT_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/materials", label: "Class Materials", icon: FileText },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
];

const SPONSOR_LINKS = [
  { href: "/sponsor/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/sponsor/dashboard/impact", label: "My Sponsorship", icon: HeartHandshake },
  { href: "/sponsor/dashboard/payments", label: "Payment History", icon: CreditCard },
  { href: "/sponsor/dashboard/receipts", label: "Receipts", icon: Receipt },
  { href: "/sponsor/dashboard/profile", label: "Profile", icon: User },
];

export function DashboardSidebar({ variant = "student" }: { variant?: "student" | "sponsor" }) {
  const pathname = usePathname();
  const links = variant === "sponsor" ? SPONSOR_LINKS : STUDENT_LINKS;

  return (
    <aside className="w-full lg:w-64 shrink-0 border-r border-border bg-card">
      <nav className="p-4 space-y-1 sticky top-16">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand text-brand-foreground"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "https://alfawzacademy.com" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>
    </aside>
  );
}
