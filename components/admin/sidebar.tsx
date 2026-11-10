"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  HeartHandshake,
  GraduationCap,
  Award,
  CalendarDays,
  MessageSquareQuote,
  Mail,
  Megaphone,
  Landmark,
  Gift,
  BarChart3,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/bank-transfers", label: "Bank Transfers", icon: Landmark },
  { href: "/admin/scholarships", label: "Scholarships", icon: Gift },
  { href: "/admin/sponsors", label: "Sponsors", icon: HeartHandshake },
  { href: "/admin/teachers", label: "Teachers", icon: GraduationCap },
  { href: "/admin/alumni", label: "Alumni", icon: Award },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/profile", label: "Profile", icon: User },
];

export function AdminSidebar({ counts = {} }: { counts?: Record<string, number> }) {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 shrink-0 border-r border-border bg-card">
      <nav className="p-4 space-y-1 sticky top-16">
        {LINKS.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          const Icon = link.icon;
          const count = counts[link.href] ?? 0;
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
              {count > 0 && (
                <span
                  className={cn(
                    "ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none",
                    active ? "bg-brand-foreground text-brand" : "bg-destructive text-destructive-foreground"
                  )}
                  aria-label={`${count} waiting`}
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>
    </aside>
  );
}
