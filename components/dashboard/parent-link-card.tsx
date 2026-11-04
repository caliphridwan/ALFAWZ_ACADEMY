"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createParentLink, revokeParentLink } from "@/app/dashboard/parent-link-actions";

export function ParentLinkCard({ token }: { token: string | null }) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  // Built in the browser (after mount, to avoid a server/client mismatch) so
  // it always matches the domain actually being used.
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const url = token && origin ? `${origin}/parent/${token}` : null;

  function create() {
    startTransition(async () => {
      try {
        await createParentLink();
        toast.success(token ? "New link created — the old one no longer works." : "Parent link created.");
      } catch {
        toast.error("Could not create the link.");
      }
    });
  }

  function revoke() {
    if (!confirm("Turn off the parent link? Anyone using it will lose access.")) return;
    startTransition(async () => {
      try {
        await revokeParentLink();
        toast.success("Parent link turned off.");
      } catch {
        toast.error("Could not turn off the link.");
      }
    });
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed — select the link and copy it manually.");
    }
  }

  return (
    <div className="rounded-lg border border-border p-6 text-sm">
      <h2 className="font-semibold mb-1">Share progress with a parent</h2>
      <p className="text-muted-foreground mb-4">
        Create a private link that shows your courses, attendance, upcoming classes and certificates —
        nothing else. No login needed, and you can turn it off at any time.
      </p>

      {token ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={url ?? `…/parent/${token}`}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 h-10 rounded-md border border-input bg-muted/40 px-3 text-xs font-mono"
              aria-label="Parent link"
            />
            <Button type="button" variant="outline" size="sm" onClick={copy} disabled={!url}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={create} disabled={pending}>
              Create a new link
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={revoke} disabled={pending}>
              Turn off
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" size="sm" onClick={create} disabled={pending}>
          {pending ? "Creating..." : "Create parent link"}
        </Button>
      )}
    </div>
  );
}
