"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import {
  createAssessment,
  updateAssessment,
  type AssessmentFormState,
} from "@/app/actions/assessments";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export type AssessmentDefaults = {
  title: string;
  instructions: string;
  kind: "QUIZ" | "TEST" | "EXAM";
  durationMinutes: number;
  opensAt: string; // datetime-local value, WAT
  closesAt: string;
  shuffleQuestions: boolean;
};

const EMPTY: AssessmentDefaults = {
  title: "",
  instructions: "",
  kind: "QUIZ",
  durationMinutes: 30,
  opensAt: "",
  closesAt: "",
  shuffleQuestions: true,
};

/** Create (courseId + base) or edit (assessmentId) an assessment's details. */
export function AssessmentForm({
  courseId,
  base,
  assessmentId,
  defaults = EMPTY,
}: {
  courseId: string;
  /** e.g. /admin/courses/ID or /teacher/courses/ID, used to open the new assessment. */
  base: string;
  assessmentId?: string;
  defaults?: AssessmentDefaults;
}) {
  const router = useRouter();
  const action = assessmentId
    ? updateAssessment.bind(null, assessmentId)
    : createAssessment.bind(null, courseId);
  const [state, formAction] = useFormState(action, { success: false } as AssessmentFormState);

  useEffect(() => {
    if (!state.success) return;
    if (assessmentId) {
      toast.success("Saved.");
      router.refresh();
    } else if (state.assessmentId) {
      router.push(`${base}/assessments/${state.assessmentId}`);
    }
  }, [state, assessmentId, base, router]);

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      {state.formError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required maxLength={150} defaultValue={defaults.title} placeholder="e.g. Tajweed test 1" />
        <FieldError messages={state.fieldErrors?.title} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="kind">Type</Label>
          <select
            id="kind"
            name="kind"
            defaultValue={defaults.kind}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="QUIZ">Quiz (counts toward continuous assessment)</option>
            <option value="TEST">Test (counts toward continuous assessment)</option>
            <option value="EXAM">Final exam</option>
          </select>
        </div>
        <div>
          <Label htmlFor="durationMinutes">Time allowed (minutes)</Label>
          <Input id="durationMinutes" name="durationMinutes" type="number" min={5} max={360} defaultValue={defaults.durationMinutes} />
          <FieldError messages={state.fieldErrors?.durationMinutes} />
        </div>
      </div>

      <div>
        <Label htmlFor="instructions">Instructions for students (optional)</Label>
        <textarea
          id="instructions"
          name="instructions"
          rows={3}
          maxLength={4000}
          defaultValue={defaults.instructions}
          placeholder="e.g. Answer all questions. You have one attempt."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="opensAt">Opens (optional, WAT)</Label>
          <Input id="opensAt" name="opensAt" type="datetime-local" defaultValue={defaults.opensAt} />
        </div>
        <div>
          <Label htmlFor="closesAt">Closes (optional, WAT)</Label>
          <Input id="closesAt" name="closesAt" type="datetime-local" defaultValue={defaults.closesAt} />
          <FieldError messages={state.fieldErrors?.closesAt} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="shuffleQuestions" defaultChecked={defaults.shuffleQuestions} />
        Show the questions in a different random order to each student
      </label>

      <Submit label={assessmentId ? "Save changes" : "Create and add questions"} />
    </form>
  );
}
