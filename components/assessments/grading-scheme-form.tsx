"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { saveGradingScheme, type AssessmentFormState } from "@/app/actions/assessments";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Saving..." : "Save scheme"}
    </Button>
  );
}

export function GradingSchemeForm({
  courseId,
  caWeight,
  examWeight,
  passMark,
}: {
  courseId: string;
  caWeight: number;
  examWeight: number;
  passMark: number;
}) {
  const [state, formAction] = useFormState(saveGradingScheme.bind(null, courseId), { success: false } as AssessmentFormState);
  useEffect(() => {
    if (state.success) toast.success("Grading scheme saved.");
  }, [state]);

  return (
    <form action={formAction} className="grid max-w-2xl gap-4 sm:grid-cols-4 sm:items-end">
      <div>
        <Label htmlFor="caWeight">Continuous assessment %</Label>
        <Input id="caWeight" name="caWeight" type="number" min={0} max={100} defaultValue={caWeight} />
      </div>
      <div>
        <Label htmlFor="examWeight">Final exam %</Label>
        <Input id="examWeight" name="examWeight" type="number" min={0} max={100} defaultValue={examWeight} />
        <FieldError messages={state.fieldErrors?.examWeight} />
      </div>
      <div>
        <Label htmlFor="passMark">Pass mark %</Label>
        <Input id="passMark" name="passMark" type="number" min={1} max={100} defaultValue={passMark} />
        <FieldError messages={state.fieldErrors?.passMark} />
      </div>
      <Submit />
    </form>
  );
}
