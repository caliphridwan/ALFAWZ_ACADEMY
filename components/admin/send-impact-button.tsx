"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendImpactUpdates } from "@/app/admin/sponsors/actions";

export function SendImpactButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Email every active sponsor the current impact figures?")) return;
        startTransition(async () => {
          try {
            const res = await sendImpactUpdates();
            if (!res.ok) toast.error(res.error ?? "Could not send.");
            else toast.success(`Sent to ${res.sent} sponsor${res.sent === 1 ? "" : "s"}${res.failed ? `, ${res.failed} failed` : ""}.`);
          } catch {
            toast.error("Could not send.");
          }
        });
      }}
    >
      {pending ? "Sending…" : "Send impact update to sponsors"}
    </Button>
  );
}
