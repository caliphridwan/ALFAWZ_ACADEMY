"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setMessageStatus } from "@/app/admin/messages/actions";

export function MessageStatusControls({ messageId, status }: { messageId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  function update(next: "READ" | "RESOLVED") {
    startTransition(async () => {
      try {
        await setMessageStatus(messageId, next);
        toast.success(`Marked as ${next.toLowerCase()}.`);
      } catch {
        toast.error("Could not update message.");
      }
    });
  }

  return (
    <div className="flex gap-2">
      {status === "NEW" && (
        <Button size="sm" variant="outline" onClick={() => update("READ")} disabled={pending}>
          Mark Read
        </Button>
      )}
      {status !== "RESOLVED" && (
        <Button size="sm" onClick={() => update("RESOLVED")} disabled={pending}>
          Resolve
        </Button>
      )}
    </div>
  );
}
