"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createCampaignCode, setReferralActive } from "@/app/admin/referrals/actions";

export function CopyLinkButton({ link, label = "Copy link" }: { link: string; label?: string }) {
  return (
    <Button
      size="sm"
      variant="outline"
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(link);
          toast.success("Link copied.");
        } catch {
          toast.error("Could not copy. Select the link and copy it by hand.");
        }
      }}
    >
      {label}
    </Button>
  );
}

export function NewCampaignForm() {
  const [label, setLabel] = useState("");
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          try {
            const res = await createCampaignCode(label, code);
            if (res.ok) {
              toast.success("Link created.");
              setLabel("");
              setCode("");
            } else toast.error(res.error ?? "Could not create.");
          } catch {
            toast.error("Could not create.");
          }
        });
      }}
    >
      <label className="text-sm font-medium">
        Name
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={80}
          placeholder="e.g. WhatsApp group"
          className="mt-1 block w-56 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="text-sm font-medium">
        Code (optional)
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={24}
          placeholder="e.g. KANO25"
          className="mt-1 block w-40 rounded-md border border-border bg-background px-3 py-2 text-sm uppercase"
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create link"}
      </Button>
    </form>
  );
}

export function ActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await setReferralActive(id, !active);
          } catch {
            toast.error("Could not update.");
          }
        })
      }
    >
      {active ? "Switch off" : "Switch on"}
    </Button>
  );
}
