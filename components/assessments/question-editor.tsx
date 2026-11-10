"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { deleteQuestion, saveQuestion, type QuestionInput } from "@/app/actions/assessments";

export type QuestionView = {
  id: string;
  type: QuestionInput["type"];
  prompt: string;
  options: string[];
  correct: string;
  points: number;
};

const TYPE_LABEL: Record<QuestionInput["type"], string> = {
  MULTIPLE_CHOICE: "Multiple choice",
  TRUE_FALSE: "True / False",
  SHORT_ANSWER: "Short answer",
  LONG_ANSWER: "Written answer (marked by teacher)",
};

const blank = (): QuestionInput => ({ type: "MULTIPLE_CHOICE", prompt: "", options: ["", "", "", ""], correct: "0", points: 1 });

function QuestionForm({
  assessmentId,
  questionId,
  initial,
  onDone,
}: {
  assessmentId: string;
  questionId: string | null;
  initial: QuestionInput;
  onDone: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState<QuestionInput>(initial);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();

  function setOption(i: number, value: string) {
    setQ((prev) => ({ ...prev, options: prev.options.map((o, idx) => (idx === i ? value : o)) }));
  }

  function changeType(type: QuestionInput["type"]) {
    setQ((prev) => ({
      ...prev,
      type,
      options: type === "MULTIPLE_CHOICE" && prev.options.length < 2 ? ["", "", "", ""] : prev.options,
      correct: type === "MULTIPLE_CHOICE" ? "0" : type === "TRUE_FALSE" ? "true" : "",
    }));
  }

  function save() {
    setErrors({});
    startTransition(async () => {
      try {
        const res = await saveQuestion(assessmentId, questionId, q);
        if (res.ok) {
          toast.success("Question saved.");
          router.refresh();
          onDone();
        } else if (res.fieldErrors) setErrors(res.fieldErrors);
        else toast.error(res.error ?? "Could not save the question.");
      } catch {
        toast.error("Could not save the question.");
      }
    });
  }

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <div>
          <Label htmlFor={`type-${questionId ?? "new"}`}>Question type</Label>
          <select
            id={`type-${questionId ?? "new"}`}
            value={q.type}
            onChange={(e) => changeType(e.target.value as QuestionInput["type"])}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {(Object.keys(TYPE_LABEL) as QuestionInput["type"][]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor={`pts-${questionId ?? "new"}`}>Points</Label>
          <Input
            id={`pts-${questionId ?? "new"}`}
            type="number"
            min={1}
            max={100}
            value={q.points}
            onChange={(e) => setQ({ ...q, points: Number(e.target.value) })}
          />
          <FieldError messages={errors.points} />
        </div>
      </div>

      <div>
        <Label htmlFor={`prompt-${questionId ?? "new"}`}>Question</Label>
        <textarea
          id={`prompt-${questionId ?? "new"}`}
          rows={3}
          maxLength={2000}
          value={q.prompt}
          onChange={(e) => setQ({ ...q, prompt: e.target.value })}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <FieldError messages={errors.prompt} />
      </div>

      {q.type === "MULTIPLE_CHOICE" && (
        <div className="space-y-2">
          <Label>Choices (select the correct one)</Label>
          {q.options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${questionId ?? "new"}`}
                checked={q.correct === String(i)}
                onChange={() => setQ({ ...q, correct: String(i) })}
                aria-label={`Choice ${i + 1} is correct`}
              />
              <Input value={o} maxLength={300} onChange={(e) => setOption(i, e.target.value)} placeholder={`Choice ${i + 1}`} />
            </div>
          ))}
          {q.options.length < 8 && (
            <Button type="button" size="sm" variant="ghost" onClick={() => setQ({ ...q, options: [...q.options, ""] })}>
              + Add a choice
            </Button>
          )}
          <FieldError messages={errors.options ?? errors.correct} />
        </div>
      )}

      {q.type === "TRUE_FALSE" && (
        <div className="space-y-1">
          <Label>Correct answer</Label>
          <div className="flex gap-4 text-sm">
            {["true", "false"].map((v) => (
              <label key={v} className="flex items-center gap-2">
                <input type="radio" checked={q.correct === v} onChange={() => setQ({ ...q, correct: v })} />
                {v === "true" ? "True" : "False"}
              </label>
            ))}
          </div>
          <FieldError messages={errors.correct} />
        </div>
      )}

      {q.type === "SHORT_ANSWER" && (
        <div>
          <Label htmlFor={`acc-${questionId ?? "new"}`}>Accepted answers (optional)</Label>
          <Input
            id={`acc-${questionId ?? "new"}`}
            value={q.correct}
            maxLength={500}
            onChange={(e) => setQ({ ...q, correct: e.target.value })}
            placeholder="Separate with | e.g. Al-Fatihah | Fatiha"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Matching answers are marked automatically (ignoring capital letters and extra spaces). Leave empty to mark by hand.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="button" disabled={pending} onClick={save}>
          {pending ? "Saving..." : "Save question"}
        </Button>
        <Button type="button" variant="ghost" disabled={pending} onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function QuestionEditor({
  assessmentId,
  questions,
  locked,
}: {
  assessmentId: string;
  questions: QuestionView[];
  /** Students have started: questions can no longer change. */
  locked: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [pending, startTransition] = useTransition();

  function remove(id: string) {
    if (!window.confirm("Delete this question?")) return;
    startTransition(async () => {
      try {
        const res = await deleteQuestion(id);
        if (res.ok) {
          toast.success("Deleted.");
          router.refresh();
        } else toast.error(res.error ?? "Could not delete it.");
      } catch {
        toast.error("Could not delete it.");
      }
    });
  }

  const total = questions.reduce((s, q) => s + q.points, 0);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {questions.length} {questions.length === 1 ? "question" : "questions"} · {total} {total === 1 ? "point" : "points"} in total
        {locked ? " · Locked, because students have started" : ""}
      </p>

      {questions.map((q, i) =>
        editing === q.id ? (
          <QuestionForm
            key={q.id}
            assessmentId={assessmentId}
            questionId={q.id}
            initial={{ type: q.type, prompt: q.prompt, options: q.options.length ? q.options : ["", "", "", ""], correct: q.correct, points: q.points }}
            onDone={() => setEditing(null)}
          />
        ) : (
          <div key={q.id} className="rounded-md border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {i + 1}. {TYPE_LABEL[q.type]} · {q.points} {q.points === 1 ? "point" : "points"}
                </p>
                <p className="mt-1 whitespace-pre-line font-medium">{q.prompt}</p>
                {q.type === "MULTIPLE_CHOICE" && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {q.options.map((o, idx) => (
                      <li key={idx} className={String(idx) === q.correct ? "font-medium text-brand" : "text-muted-foreground"}>
                        {String(idx) === q.correct ? "✓ " : "• "}
                        {o}
                      </li>
                    ))}
                  </ul>
                )}
                {q.type === "TRUE_FALSE" && (
                  <p className="mt-2 text-sm text-brand">Correct answer: {q.correct === "true" ? "True" : "False"}</p>
                )}
                {q.type === "SHORT_ANSWER" && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {q.correct ? `Accepted: ${q.correct.split("|").map((s) => s.trim()).filter(Boolean).join(", ")}` : "Marked by hand"}
                  </p>
                )}
              </div>
              {!locked && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={pending} onClick={() => setEditing(q.id)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => remove(q.id)}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
      )}

      {!locked &&
        (editing === "new" ? (
          <QuestionForm assessmentId={assessmentId} questionId={null} initial={blank()} onDone={() => setEditing(null)} />
        ) : (
          <Button variant="outline" onClick={() => setEditing("new")}>
            + Add a question
          </Button>
        ))}
    </div>
  );
}
