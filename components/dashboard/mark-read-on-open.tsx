"use client";

import { useEffect } from "react";
import { markNotificationRead } from "@/app/dashboard/notifications/actions";

/** Marks a notification as read once its page has been opened (this also refreshes the unread counter). */
export function MarkReadOnOpen({ id }: { id: string }) {
  useEffect(() => {
    void markNotificationRead(id).catch(() => {});
  }, [id]);
  return null;
}
