"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startAttempt } from "@/app/dashboard/assessments/actions";

export function StartButton({ assessmentId, label, minutes }: { assessmentId: string; label: string; minutes: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function go() {
    if (label === "Start" && !window.confirm(`Start now? You have ${minutes} minutes and only one attempt. The timer cannot be paused.`)) return;
    startTransition(async () => {
      try {
        const res = await startAttempt(assessmentId);
        if (res.ok) router.push(`/dashboard/assessments/${assessmentId}/take`);
        else toast.error(res.error ?? "Could not start.");
      } catch {
        toast.error("Could not start. Please try again.");
      }
    });
  }

  return (
    <Button size="lg" disabled={pending} onClick={go}>
      {pending ? "Starting..." : label}
    </Button>
  );
}
