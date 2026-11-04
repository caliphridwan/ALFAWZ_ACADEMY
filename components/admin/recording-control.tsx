"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setSessionRecording } from "@/app/admin/courses/[id]/sessions/actions";

export function RecordingControl({ sessionId, initialUrl }: { sessionId: string; initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        const res = await setSessionRecording(sessionId, url);
        if (res.ok) toast.success(url.trim() ? "Recording saved." : "Recording removed.");
        else toast.error(res.error ?? "Could not save the recording.");
      } catch {
        toast.error("Could not save the recording.");
      }
    });
  }

  return (
    <div className="flex w-64 items-center gap-2">
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Recording link (https://...)"
        className="h-9 text-xs"
        aria-label="Recording link"
      />
      <Button size="sm" variant="outline" onClick={save} disabled={pending}>
        Save
      </Button>
    </div>
  );
}
