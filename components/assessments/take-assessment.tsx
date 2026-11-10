"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { saveAnswers, submitAttempt } from "@/app/dashboard/assessments/actions";

export type TakeQuestion = {
  id: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "LONG_ANSWER";
  prompt: string;
  points: number;
  /** Already in the order to show; `index` is the value saved. */
  options: { index: number; text: string }[];
};

function format(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function TakeAssessment({
  assessmentId,
  attemptId,
  title,
  questions,
  initialAnswers,
  remainingMs,
}: {
  assessmentId: string;
  attemptId: string;
  title: string;
  questions: TakeQuestion[];
  initialAnswers: Record<string, string>;
  /** Time left according to the server when the page was built. */
  remainingMs: number;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  // The end time is fixed once, from the server's remaining time, so a wrong device clock does not matter.
  const endAt = useRef(Date.now() + remainingMs);
  const [left, setLeft] = useState(remainingMs);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitting, startSubmit] = useTransition();
  const done = useRef(false);
  const latest = useRef(answers);
  latest.current = answers;
  const dirty = useRef(false);

  const submit = useCallback(
    (auto: boolean) => {
      if (done.current) return;
      done.current = true;
      startSubmit(async () => {
        try {
          const res = await submitAttempt(attemptId, latest.current);
          if (!res.ok) {
            done.current = false;
            toast.error(res.error ?? "Could not submit. Please try again.");
            return;
          }
          if (auto) toast.info("Time is up. Your answers were submitted.");
          router.replace(`/dashboard/assessments/${assessmentId}`);
        } catch {
          done.current = false;
          toast.error("Could not submit. Check your connection and try again.");
        }
      });
    },
    [attemptId, assessmentId, router]
  );

  // Countdown; submits by itself at zero.
  useEffect(() => {
    const tick = () => {
      const ms = endAt.current - Date.now();
      setLeft(ms);
      if (ms <= 0) submit(true);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [submit]);

  // Autosave a moment after the last change.
  useEffect(() => {
    if (!dirty.current) return;
    setSaved("saving");
    const id = setTimeout(async () => {
      try {
        const res = await saveAnswers(attemptId, latest.current);
        if (res.ok) setSaved("saved");
        else if (res.expired) submit(true);
        else setSaved("error");
      } catch {
        setSaved("error");
      }
    }, 1200);
    return () => clearTimeout(id);
  }, [answers, attemptId, submit]);

  // Warn before closing the tab mid-exam.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (done.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  function setAnswer(id: string, value: string) {
    dirty.current = true;
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  const answered = questions.filter((q) => (answers[q.id] ?? "").trim() !== "").length;
  const low = left <= 5 * 60 * 1000;

  return (
    <div className="max-w-3xl">
      <div className="sticky top-16 z-20 -mx-2 mb-6 flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 shadow-sm">
        <div className="min-w-0">
          <p className="truncate font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">
            {answered} of {questions.length} answered ·{" "}
            {saved === "saving" ? "Saving..." : saved === "saved" ? "Saved" : saved === "error" ? "Not saved, check your connection" : "Answers save automatically"}
          </p>
        </div>
        <div
          className={`rounded-md px-3 py-2 font-mono text-lg font-bold ${low ? "bg-destructive text-destructive-foreground" : "bg-brand/10 text-brand"}`}
          aria-live="off"
          aria-label="Time left"
        >
          {format(left)}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">
              Question {i + 1} · {q.points} {q.points === 1 ? "point" : "points"}
            </p>
            <p className="mt-1 whitespace-pre-line font-medium">{q.prompt}</p>

            <div className="mt-4">
              {q.type === "MULTIPLE_CHOICE" && (
                <div className="space-y-2">
                  {q.options.map((o) => (
                    <label key={o.index} className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 text-sm hover:bg-muted/50">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        className="mt-0.5"
                        checked={answers[q.id] === String(o.index)}
                        onChange={() => setAnswer(q.id, String(o.index))}
                      />
                      <span>{o.text}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.type === "TRUE_FALSE" && (
                <div className="flex gap-3">
                  {["true", "false"].map((v) => (
                    <label key={v} className="flex flex-1 cursor-pointer items-center gap-3 rounded-md border border-border p-3 text-sm hover:bg-muted/50">
                      <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === v} onChange={() => setAnswer(q.id, v)} />
                      {v === "true" ? "True" : "False"}
                    </label>
                  ))}
                </div>
              )}
              {q.type === "SHORT_ANSWER" && (
                <input
                  value={answers[q.id] ?? ""}
                  maxLength={500}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                  placeholder="Your answer"
                />
              )}
              {q.type === "LONG_ANSWER" && (
                <textarea
                  value={answers[q.id] ?? ""}
                  maxLength={10000}
                  rows={6}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Write your answer here"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button
          size="lg"
          disabled={submitting}
          onClick={() => {
            const unanswered = questions.length - answered;
            const msg = unanswered > 0 ? `You have ${unanswered} unanswered ${unanswered === 1 ? "question" : "questions"}. Submit anyway?` : "Submit your answers now? You cannot change them afterwards.";
            if (window.confirm(msg)) submit(false);
          }}
        >
          {submitting ? "Submitting..." : "Submit answers"}
        </Button>
        <p className="text-sm text-muted-foreground">It submits by itself when the time runs out.</p>
      </div>
    </div>
  );
}
