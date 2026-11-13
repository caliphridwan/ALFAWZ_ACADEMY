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
  Contact,
  Mic,
  ClipboardCheck,
  Share2,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SidebarShell } from "@/components/ui/sidebar-shell";

const STUDENT_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/materials", label: "Class Materials", icon: FileText },
  { href: "/dashboard/recitations", label: "Recitations", icon: Mic },
  { href: "/dashboard/assessments", label: "Assessments", icon: ClipboardCheck },
  { href: "/dashboard/chat", label: "Course Chat", icon: MessageCircle },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/dashboard/id-card", label: "ID Card", icon: Contact },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/refer", label: "Invite Friends", icon: Share2 },
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
];

const SPONSOR_LINKS = [
  { href: "/sponsor/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/sponsor/dashboard/impact", label: "My Sponsorship", icon: HeartHandshake },
  { href: "/sponsor/dashboard/payments", label: "Payment History", icon: CreditCard },
  { href: "/sponsor/dashboard/receipts", label: "Receipts", icon: Receipt },
  { href: "/sponsor/dashboard/profile", label: "Profile", icon: User },
];

export function DashboardSidebar({
  variant = "student",
  unreadNotifications = 0,
  pendingRecitations = 0,
  pendingAssessments = 0,
  unreadChat = 0,
}: {
  variant?: "student" | "sponsor";
  /** Number of unread notifications, shown as a badge on the Notifications link. */
  unreadNotifications?: number;
  pendingRecitations?: number;
  pendingAssessments?: number;
  unreadChat?: number;
}) {
  const pathname = usePathname();
  const links = variant === "sponsor" ? SPONSOR_LINKS : STUDENT_LINKS;

  return (
    <SidebarShell badge={unreadNotifications + pendingRecitations + pendingAssessments + unreadChat}>
      <nav className="p-4 space-y-1 lg:sticky lg:top-16">
        {links.map((link) => {
          const active = pathname === link.href || (link.href === "/dashboard/chat" && pathname.startsWith("/dashboard/chat/"));
          const Icon = link.icon;
          const badgeCount =
            link.href === "/dashboard/notifications"
              ? unreadNotifications
              : link.href === "/dashboard/recitations"
                ? pendingRecitations
                : link.href === "/dashboard/assessments"
                  ? pendingAssessments
                  : link.href === "/dashboard/chat"
                    ? unreadChat
                    : 0;
          const badgeNoun =
            link.href === "/dashboard/notifications"
              ? "unread notifications"
              : link.href === "/dashboard/recitations"
                ? "recitations to do"
                : link.href === "/dashboard/chat"
                  ? "unread chat messages"
                  : "assessments to take";
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
              {badgeCount > 0 && (
                <span
                  className={cn(
                    "ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none",
                    active ? "bg-brand-foreground text-brand" : "bg-destructive text-destructive-foreground"
                  )}
                  aria-label={`${badgeCount} ${badgeNoun}`}
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
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
    </SidebarShell>
  );
}
