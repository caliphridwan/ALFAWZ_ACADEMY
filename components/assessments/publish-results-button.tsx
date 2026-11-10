"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { publishResults } from "@/app/actions/assessments";

export function PublishResultsButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run() {
    if (!window.confirm("Record each student's final result and tell them? Students who still have answers waiting to be marked are skipped.")) return;
    startTransition(async () => {
      try {
        const res = await publishResults(courseId);
        if (res.ok) {
          toast.success(`Published for ${res.published} ${res.published === 1 ? "student" : "students"}${res.skipped ? `, ${res.skipped} skipped (marks outstanding or nothing to grade yet)` : ""}.`);
          router.refresh();
        } else toast.error(res.error ?? "Could not publish the results.");
      } catch {
        toast.error("Could not publish the results.");
      }
    });
  }

  return (
    <Button disabled={pending} onClick={run}>
      {pending ? "Publishing..." : "Publish final results"}
    </Button>
  );
}
