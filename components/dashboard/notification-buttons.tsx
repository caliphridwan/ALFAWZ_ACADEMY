"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markNotificationRead, markAllNotificationsRead } from "@/app/dashboard/notifications/actions";

export function MarkReadButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await markNotificationRead(id);
          } catch {
            toast.error("Could not update notification.");
          }
        })
      }
    >
      Mark read
    </Button>
  );
}

export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await markAllNotificationsRead();
            toast.success("All notifications marked as read.");
          } catch {
            toast.error("Could not update notifications.");
          }
        })
      }
    >
      Mark all as read
    </Button>
  );
}
