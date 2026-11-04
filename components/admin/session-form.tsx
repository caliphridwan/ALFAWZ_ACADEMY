"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import {
  createClassSessions,
  type SessionFormState,
} from "@/app/admin/courses/[id]/sessions/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Scheduling..." : "Schedule Class"}
    </Button>
  );
}

export function SessionForm({ courseId }: { courseId: string }) {
  const [state, formAction] = useFormState(createClassSessions, { success: false } as SessionFormState);

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      <input type="hidden" name="courseId" value={courseId} />

      {state.formError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}
      {state.success && (
        <div className="rounded-md bg-brand/10 border border-brand/20 px-4 py-3 text-sm text-brand">
          {state.created === 1 ? "Class scheduled." : `${state.created} classes scheduled.`}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <Label htmlFor="startsAt">Date &amp; time (WAT)</Label>
          <Input id="startsAt" name="startsAt" type="datetime-local" required />
          <FieldError messages={state.fieldErrors?.startsAt} />
        </div>
        <div>
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input id="durationMinutes" name="durationMinutes" type="number" min={10} max={480} defaultValue={60} required />
          <FieldError messages={state.fieldErrors?.durationMinutes} />
        </div>
        <div>
          <Label htmlFor="repeatWeeks">Repeat weekly for</Label>
          <Input id="repeatWeeks" name="repeatWeeks" type="number" min={1} max={26} defaultValue={1} />
          <p className="text-xs text-muted-foreground mt-1">weeks (1 = just once)</p>
          <FieldError messages={state.fieldErrors?.repeatWeeks} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="topic">Topic (optional)</Label>
          <Input id="topic" name="topic" placeholder="e.g. Makharij of the throat letters" />
          <FieldError messages={state.fieldErrors?.topic} />
        </div>
        <div>
          <Label htmlFor="zoomLink">Zoom link for this class (optional)</Label>
          <Input id="zoomLink" name="zoomLink" placeholder="Leave blank to use the course Zoom link" />
          <FieldError messages={state.fieldErrors?.zoomLink} />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
