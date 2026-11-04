"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { nudgeStudent } from "@/app/admin/reports/actions";

export function NudgeButton({ studentId, courseId }: { studentId: string; courseId: string }) {
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending || sent}
      onClick={() =>
        startTransition(async () => {
          try {
            const res = await nudgeStudent(studentId, courseId);
            if (res.ok) {
              setSent(true);
              toast.success("Check-in sent.");
            } else {
              toast.error(res.error ?? "Could not send.");
            }
          } catch {
            toast.error("Could not send.");
          }
        })
      }
    >
      {sent ? "Sent" : "Send check-in"}
    </Button>
  );
}
