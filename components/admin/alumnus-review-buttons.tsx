"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveAlumnus, rejectAlumnus } from "@/app/admin/alumni/actions";

export function AlumnusReviewButtons({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  function run(kind: "approve" | "reject") {
    if (kind === "reject" && !confirm("Reject this submission? It will stay hidden from the public page.")) return;
    startTransition(async () => {
      try {
        if (kind === "approve") await approveAlumnus(id);
        else await rejectAlumnus(id);
        toast.success(kind === "approve" ? "Approved and published." : "Rejected.");
      } catch {
        toast.error("Could not update this submission.");
      }
    });
  }

  return (
    <div className="flex gap-2">
      {status !== "APPROVED" && (
        <Button size="sm" onClick={() => run("approve")} disabled={pending}>
          Approve
        </Button>
      )}
      {status === "PENDING" && (
        <Button size="sm" variant="destructive" onClick={() => run("reject")} disabled={pending}>
          Reject
        </Button>
      )}
    </div>
  );
}
