"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteRecitationTask, reviewRecitation } from "@/app/actions/recitations";

export function ReviewForm({
  submissionId,
  initialRating,
  initialFeedback,
}: {
  submissionId: string;
  initialRating: number | null;
  initialFeedback: string | null;
}) {
  const [rating, setRating] = useState(initialRating ?? 0);
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        const res = await reviewRecitation(submissionId, rating, feedback);
        if (res.ok) toast.success("Feedback sent to the student.");
        else toast.error(res.error ?? "Could not save the feedback.");
      } catch {
        toast.error("Could not save the feedback.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} out of 5`}
            onClick={() => setRating(n)}
            className="p-0.5"
          >
            <Star
              size={22}
              className={n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Feedback for the student (what was good, what to practise)"
        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <Button size="sm" onClick={save} disabled={pending || rating === 0}>
        {pending ? "Sending..." : initialRating ? "Update feedback" : "Send feedback"}
      </Button>
    </div>
  );
}

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this task and all recordings sent for it?")) return;
        startTransition(async () => {
          try {
            const res = await deleteRecitationTask(taskId);
            if (res.ok) toast.success("Task deleted.");
            else toast.error(res.error ?? "Could not delete the task.");
          } catch {
            toast.error("Could not delete the task.");
          }
        });
      }}
    >
      Delete task
    </Button>
  );
}
