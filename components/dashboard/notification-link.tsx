"use client";

import Link from "next/link";
import { markNotificationRead } from "@/app/dashboard/notifications/actions";

/**
 * Makes a notification's text a link to the page it is about. Opening it also
 * marks the notification as read, so the unread counter goes down.
 */
export function NotificationLink({
  id,
  href,
  read,
  children,
}: {
  id: string;
  href: string;
  read: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block flex-1 rounded-md outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand"
      onClick={() => {
        if (!read) void markNotificationRead(id).catch(() => {});
      }}
    >
      {children}
    </Link>
  );
}
