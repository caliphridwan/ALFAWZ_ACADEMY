"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setSponsorshipPublicDisplay, setSponsorshipStatus } from "@/app/admin/sponsors/actions";

type Props = {
  sponsorshipId: string;
  showPublicly: boolean;
  publicName: string | null;
  status: string;
};

export function SponsorshipRowControls({ sponsorshipId, showPublicly, publicName, status }: Props) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(publicName ?? "");

  function togglePublic() {
    startTransition(async () => {
      try {
        await setSponsorshipPublicDisplay(sponsorshipId, !showPublicly, name);
        toast.success(showPublicly ? "Removed from public recognition." : "Approved for public recognition.");
      } catch {
        toast.error("Could not update recognition status.");
      }
    });
  }

  function toggleActive() {
    const next = status === "ACTIVE" ? "CANCELLED" : "ACTIVE";
    startTransition(async () => {
      try {
        await setSponsorshipStatus(sponsorshipId, next as any);
        toast.success(`Sponsorship marked ${next.toLowerCase()}.`);
      } catch {
        toast.error("Could not update sponsorship status.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Public display name"
        className="h-9 w-40 rounded-md border border-input bg-background px-2 text-xs"
      />
      <Button size="sm" variant={showPublicly ? "destructive" : "outline"} onClick={togglePublic} disabled={pending}>
        {showPublicly ? "Remove Public" : "Approve Public"}
      </Button>
      <Button size="sm" variant="outline" onClick={toggleActive} disabled={pending}>
        {status === "ACTIVE" ? "Mark Inactive" : "Mark Active"}
      </Button>
    </div>
  );
}
