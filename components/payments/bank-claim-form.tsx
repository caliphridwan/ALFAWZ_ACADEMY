"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { submitBankClaim, type ClaimFormState } from "@/app/dashboard/bank-transfer/actions";

type CourseOption = { id: string; title: string; price: number; currency: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Submitting..." : "Submit for confirmation"}
    </Button>
  );
}

export function BankClaimForm({
  courses,
  initialCourseId,
}: {
  courses: CourseOption[];
  initialCourseId?: string;
}) {
  const [state, formAction] = useFormState(submitBankClaim, { success: false } as ClaimFormState);
  const first = courses.find((c) => c.id === initialCourseId) ?? courses[0];
  const [courseId, setCourseId] = useState(first?.id ?? "");
  const selected = courses.find((c) => c.id === courseId);

  if (state.success) {
    return (
      <div className="rounded-md bg-brand/10 border border-brand/20 px-4 py-4 text-sm text-brand">
        Thank you! We&apos;ve received your receipt and will confirm it shortly. You&apos;ll get a notification and an
        email once your enrolment is active.
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
        <Label htmlFor="courseId">Course you paid for</Label>
        <select
          id="courseId"
          name="courseId"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} — {c.currency} {c.price.toLocaleString()}
            </option>
          ))}
        </select>
        <FieldError messages={state.fieldErrors?.courseId} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount you sent</Label>
          <Input
            key={courseId}
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={selected?.price}
          />
          <FieldError messages={state.fieldErrors?.amount} />
        </div>
        <div>
          <Label htmlFor="paidOn">Date of transfer</Label>
          <Input id="paidOn" name="paidOn" type="date" />
        </div>
      </div>

      <div>
        <Label htmlFor="senderName">Name on the account you sent from</Label>
        <Input id="senderName" name="senderName" required />
        <FieldError messages={state.fieldErrors?.senderName} />
      </div>

      <div>
        <ImageUploadField id="receiptUrl" name="receiptUrl" label="Receipt or screenshot (recommended)" />
        <FieldError messages={state.fieldErrors?.receiptUrl} />
      </div>

      <div>
        <Label htmlFor="note">Anything else we should know? (optional)</Label>
        <Input id="note" name="note" maxLength={500} />
      </div>

      <SubmitButton />
    </form>
  );
}
