"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setExamResult } from "@/app/admin/students/actions";

export function ExamResultControls({ enrollmentId }: { enrollmentId: string }) {
  const [pending, startTransition] = useTransition();

  function record(result: "PASSED" | "FAILED") {
    const verb = result === "PASSED" ? "passed" : "failed (repeating the class)";
    if (!confirm(`Mark this student as ${verb}? They'll see a notification on their dashboard.`)) {
      return;
    }
    startTransition(async () => {
      try {
        await setExamResult(enrollmentId, result);
        toast.success(`Recorded: ${result === "PASSED" ? "Passed" : "Failed"}`);
      } catch {
        toast.error("Could not record the result.");
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => record("PASSED")} disabled={pending}>
        Mark Passed
      </Button>
      <Button size="sm" variant="destructive" onClick={() => record("FAILED")} disabled={pending}>
        Mark Failed
      </Button>
    </div>
  );
}
