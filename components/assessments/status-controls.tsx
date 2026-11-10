"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteAssessment, setAssessmentStatus } from "@/app/actions/assessments";

export function StatusControls({
  assessmentId,
  status,
  backHref,
}: {
  assessmentId: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  backHref: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(next: "DRAFT" | "PUBLISHED" | "CLOSED", confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(async () => {
      try {
        const res = await setAssessmentStatus(assessmentId, next);
        if (res.ok) {
          toast.success(next === "PUBLISHED" ? "Published. Students have been notified." : next === "CLOSED" ? "Closed." : "Saved.");
          router.refresh();
        } else toast.error(res.error ?? "Could not change the status.");
      } catch {
        toast.error("Could not change the status.");
      }
    });
  }

  function remove() {
    if (!window.confirm("Delete this assessment and all its questions?")) return;
    startTransition(async () => {
      try {
        const res = await deleteAssessment(assessmentId);
        if (res.ok) {
          toast.success("Deleted.");
          router.push(backHref);
        } else toast.error(res.error ?? "Could not delete it.");
      } catch {
        toast.error("Could not delete it.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "DRAFT" && (
        <Button disabled={pending} onClick={() => change("PUBLISHED", "Publish now? Students in this course will be notified and can start it.")}>
          Publish to students
        </Button>
      )}
      {status === "PUBLISHED" && (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => change("CLOSED", "Close it? Anyone still writing will be stopped and their answers marked now.")}
        >
          Close assessment
        </Button>
      )}
      {status === "CLOSED" && (
        <Button variant="outline" disabled={pending} onClick={() => change("PUBLISHED")}>
          Reopen
        </Button>
      )}
      <Button variant="ghost" disabled={pending} onClick={remove}>
        Delete
      </Button>
    </div>
  );
}
