"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveMarks } from "@/app/actions/assessments";

export type MarkRow = {
  answerId: string;
  prompt: string;
  type: string;
  points: number;
  response: string;
  /** What the student wrote for a question that is auto-marked (shown for context only). */
  autoMarked: boolean;
  score: number | null;
  feedback: string;
  correctText: string | null;
};

/** One student's written answers, with a mark and a comment for each. */
export function MarkingForm({ attemptId, rows }: { attemptId: string; rows: MarkRow[] }) {
  const router = useRouter();
  const [marks, setMarks] = useState<Record<string, { score: string; feedback: string }>>(
    Object.fromEntries(rows.map((r) => [r.answerId, { score: r.score === null ? "" : String(r.score), feedback: r.feedback }]))
  );
  const [pending, startTransition] = useTransition();

  function save() {
    const payload: { answerId: string; score: number; feedback: string }[] = [];
    for (const r of rows) {
      if (r.autoMarked) continue;
      const m = marks[r.answerId];
      if (!m || m.score.trim() === "") {
        toast.error("Give a mark for every written answer (0 if wrong).");
        return;
      }
      payload.push({ answerId: r.answerId, score: Number(m.score), feedback: m.feedback });
    }
    startTransition(async () => {
      try {
        const res = await saveMarks(attemptId, payload);
        if (res.ok) {
          toast.success("Marks saved.");
          router.refresh();
        } else toast.error(res.error ?? "Could not save the marks.");
      } catch {
        toast.error("Could not save the marks.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {rows.map((r, i) => (
        <div key={r.answerId} className="rounded-md border border-border p-4">
          <p className="text-xs text-muted-foreground">
            Question {i + 1} · {r.points} {r.points === 1 ? "point" : "points"}
          </p>
          <p className="mt-1 whitespace-pre-line font-medium">{r.prompt}</p>
          <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm whitespace-pre-line">
            {r.response.trim() ? r.response : <span className="text-muted-foreground">No answer given</span>}
          </div>
          {r.correctText && <p className="mt-2 text-xs text-muted-foreground">Expected: {r.correctText}</p>}

          {r.autoMarked ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Marked automatically: {r.score ?? 0} / {r.points}
            </p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-[8rem_1fr]">
              <div>
                <label className="text-xs text-muted-foreground" htmlFor={`m-${r.answerId}`}>
                  Mark (0–{r.points})
                </label>
                <Input
                  id={`m-${r.answerId}`}
                  type="number"
                  min={0}
                  max={r.points}
                  value={marks[r.answerId]?.score ?? ""}
                  onChange={(e) => setMarks({ ...marks, [r.answerId]: { ...marks[r.answerId], score: e.target.value } })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground" htmlFor={`f-${r.answerId}`}>
                  Comment for the student (optional)
                </label>
                <Input
                  id={`f-${r.answerId}`}
                  maxLength={2000}
                  value={marks[r.answerId]?.feedback ?? ""}
                  onChange={(e) => setMarks({ ...marks, [r.answerId]: { ...marks[r.answerId], feedback: e.target.value } })}
                />
              </div>
            </div>
          )}
        </div>
      ))}
      {rows.some((r) => !r.autoMarked) && (
        <Button disabled={pending} onClick={save}>
          {pending ? "Saving..." : "Save marks"}
        </Button>
      )}
    </div>
  );
}
