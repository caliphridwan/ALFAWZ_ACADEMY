"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { sendPaymentRemindersNow, type SendRemindersState } from "@/app/admin/payments/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      {pending ? "Sending..." : "Send Payment Reminders Now"}
    </Button>
  );
}

export function SendRemindersButton() {
  const [state, formAction] = useFormState(sendPaymentRemindersNow, {} as SendRemindersState);

  return (
    <div className="mb-6">
      <form action={formAction}>
        <SubmitButton />
      </form>

      {state.error && <p className="text-sm text-destructive mt-2">{state.error}</p>}

      {state.result && (
        <p className="text-sm text-muted-foreground mt-2">
          Checked {state.result.checked} pending enrollment
          {state.result.checked === 1 ? "" : "s"} — sent {state.result.sent} reminder
          {state.result.sent === 1 ? "" : "s"}
          {state.result.skippedClosed > 0 &&
            `, skipped ${state.result.skippedClosed} where registration already closed`}
          {state.result.failed > 0 && `, ${state.result.failed} failed to send`}.
        </p>
      )}
    </div>
  );
}
