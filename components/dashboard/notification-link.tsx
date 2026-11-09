"use client";

import Link from "next/link";
/** Makes a notification in the list open its own full-message page (which marks it read). */
export function NotificationLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block flex-1 rounded-md outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand"
    >
      {children}
    </Link>
  );
}
