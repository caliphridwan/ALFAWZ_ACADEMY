"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleAlumnusPublished } from "@/app/admin/alumni/actions";

export function AlumnusPublishToggle({ id, published }: { id: string; published: boolean }) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      try {
        await toggleAlumnusPublished(id, !published);
        toast.success(published ? "Unpublished." : "Published.");
      } catch {
        toast.error("Could not update alumnus.");
      }
    });
  }

  return (
    <Button size="sm" variant={published ? "outline" : "default"} onClick={toggle} disabled={pending}>
      {pending ? "..." : published ? "Unpublish" : "Publish"}
    </Button>
  );
}
