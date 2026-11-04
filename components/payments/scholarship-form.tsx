"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { applyForScholarship, type ScholarshipFormState } from "@/app/dashboard/scholarship/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending..." : "Submit application"}
    </Button>
  );
}

export function ScholarshipForm({ courses }: { courses: { id: string; title: string }[] }) {
  const [state, formAction] = useFormState(applyForScholarship, { success: false } as ScholarshipFormState);

  if (state.success) {
    return (
      <div className="rounded-md bg-brand/10 border border-brand/20 px-4 py-4 text-sm text-brand">
        Thank you. We&apos;ve received your application and will get back to you by notification and email.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state.formError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}
      <div>
        <Label htmlFor="courseId">Course</Label>
        <select
          id="courseId"
          name="courseId"
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <FieldError messages={state.fieldErrors?.courseId} />
      </div>
      <div>
        <Label htmlFor="reason">Why are you applying?</Label>
        <textarea
          id="reason"
          name="reason"
          required
          rows={6}
          maxLength={2000}
          placeholder="Tell us about your situation and why you'd like to study this course."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <FieldError messages={state.fieldErrors?.reason} />
      </div>
      <SubmitButton />
    </form>
  );
}
