"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  sendEnrollmentRemindersNow,
  type SendEnrollmentRemindersState,
} from "@/app/admin/students/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      {pending ? "Sending..." : "Send Enrollment Reminders Now"}
    </Button>
  );
}

export function SendEnrollmentRemindersButton() {
  const [state, formAction] = useFormState(
    sendEnrollmentRemindersNow,
    {} as SendEnrollmentRemindersState
  );

  return (
    <div className="mb-6">
      <form action={formAction}>
        <SubmitButton />
      </form>

      {state.error && <p className="text-sm text-destructive mt-2">{state.error}</p>}

      {state.result && (
        <p className="text-sm text-muted-foreground mt-2">
          Checked {state.result.checked} registered student
          {state.result.checked === 1 ? "" : "s"} with no enrollments — sent{" "}
          {state.result.sent} reminder{state.result.sent === 1 ? "" : "s"}
          {state.result.failed > 0 && `, ${state.result.failed} failed to send`}.
        </p>
      )}
    </div>
  );
}
