"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  deleteClassSession,
  setSessionCancelled,
} from "@/app/admin/courses/[id]/sessions/actions";

export function SessionRowControls({
  sessionId,
  cancelled,
}: {
  sessionId: string;
  cancelled: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function toggleCancelled() {
    startTransition(async () => {
      try {
        await setSessionCancelled(sessionId, !cancelled);
        toast.success(cancelled ? "Class restored." : "Class cancelled.");
      } catch {
        toast.error("Could not update the class.");
      }
    });
  }

  function remove() {
    if (!confirm("Delete this class? Any attendance marked for it will be deleted too.")) return;
    startTransition(async () => {
      try {
        await deleteClassSession(sessionId);
        toast.success("Class deleted.");
      } catch {
        toast.error("Could not delete the class.");
      }
    });
  }

  return (
    <div className="flex gap-2 justify-end">
      <Button size="sm" variant="outline" onClick={toggleCancelled} disabled={pending}>
        {cancelled ? "Restore" : "Cancel"}
      </Button>
      <Button size="sm" variant="destructive" onClick={remove} disabled={pending}>
        Delete
      </Button>
    </div>
  );
}
