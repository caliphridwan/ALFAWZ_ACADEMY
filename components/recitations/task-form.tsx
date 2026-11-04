"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { createRecitationTask, type TaskFormState } from "@/app/actions/recitations";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Set task"}
    </Button>
  );
}

export function RecitationTaskForm({ courseId }: { courseId: string }) {
  const action = createRecitationTask.bind(null, courseId);
  const [state, formAction] = useFormState(action, { success: false } as TaskFormState);

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      {state.formError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}
      {state.success && (
        <div className="rounded-md bg-brand/10 border border-brand/20 px-4 py-3 text-sm text-brand">
          Task set. Students have been notified.
        </div>
      )}
      <div>
        <Label htmlFor="title">Task</Label>
        <Input id="title" name="title" required maxLength={150} placeholder="e.g. Recite Surah An-Naba, verses 1–10" />
        <FieldError messages={state.fieldErrors?.title} />
      </div>
      <div>
        <Label htmlFor="instructions">Instructions (optional)</Label>
        <textarea
          id="instructions"
          name="instructions"
          rows={3}
          maxLength={2000}
          placeholder="What to focus on — e.g. pay attention to the ghunnah and madd rules."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <FieldError messages={state.fieldErrors?.instructions} />
      </div>
      <div className="max-w-xs">
        <Label htmlFor="dueAt">Due (optional, WAT)</Label>
        <Input id="dueAt" name="dueAt" type="datetime-local" />
      </div>
      <SubmitButton />
    </form>
  );
}
