"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleTestimonialPublished } from "@/app/admin/testimonials/actions";

export function TestimonialPublishToggle({ id, published }: { id: string; published: boolean }) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      try {
        await toggleTestimonialPublished(id, !published);
        toast.success(published ? "Unpublished." : "Published.");
      } catch {
        toast.error("Could not update testimonial.");
      }
    });
  }

  return (
    <Button size="sm" variant={published ? "outline" : "default"} onClick={toggle} disabled={pending}>
      {pending ? "..." : published ? "Unpublish" : "Publish"}
    </Button>
  );
}
