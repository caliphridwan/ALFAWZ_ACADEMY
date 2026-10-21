"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { sendClassCommencementNow, type SendCommencementState } from "@/app/admin/courses/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      {pending ? "Sending..." : "Send Commencement Notices Now"}
    </Button>
  );
}

export function SendClassCommencementButton() {
  const [state, formAction] = useFormState(sendClassCommencementNow, {} as SendCommencementState);

  return (
    <div className="mb-6">
      <form action={formAction}>
        <SubmitButton />
      </form>

      {state.error && <p className="text-sm text-destructive mt-2">{state.error}</p>}

      {state.result && (
        <p className="text-sm text-muted-foreground mt-2">
          Checked {state.result.checked} enrollment
          {state.result.checked === 1 ? "" : "s"} with an upcoming or recent
          start date — sent {state.result.sent} notice
          {state.result.sent === 1 ? "" : "s"}
          {state.result.failed > 0 && `, ${state.result.failed} failed to send`}.
        </p>
      )}
    </div>
  );
}
