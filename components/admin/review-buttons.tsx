"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Result = { ok: boolean; error?: string };

/** Approve / Reject pair shared by the bank-transfer and scholarship queues. */
export function ReviewButtons({
  approve,
  reject,
  approveLabel = "Approve",
  askReason = true,
  confirmApprove,
}: {
  approve: () => Promise<Result>;
  reject: (reason: string) => Promise<Result>;
  approveLabel?: string;
  askReason?: boolean;
  confirmApprove?: string;
}) {
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<Result>, success: string) {
    startTransition(async () => {
      try {
        const res = await fn();
        if (res.ok) toast.success(success);
        else toast.error(res.error ?? "Something went wrong.");
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() => {
          if (confirmApprove && !confirm(confirmApprove)) return;
          run(approve, "Approved and student enrolled.");
        }}
      >
        {approveLabel}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          const reason = askReason ? prompt("Reason (the student will see this):") : "";
          if (reason === null) return;
          run(() => reject(reason), "Declined.");
        }}
      >
        Decline
      </Button>
    </div>
  );
}
