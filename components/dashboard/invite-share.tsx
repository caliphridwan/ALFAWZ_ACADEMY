"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function InviteShare({ link, message }: { link: string; message: string }) {
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${message} ${link}`)}`;
  return (
    <div className="flex flex-wrap gap-2">
      <Button
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
        Copy link
      </Button>
      <Button asChild variant="outline">
        <a href={whatsapp} target="_blank" rel="noopener noreferrer">
          Share on WhatsApp
        </a>
      </Button>
    </div>
  );
}
