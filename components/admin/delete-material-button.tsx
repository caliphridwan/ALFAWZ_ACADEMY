"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteMaterial } from "@/app/admin/courses/[id]/materials/actions";

export function DeleteMaterialButton({ materialId, courseId }: { materialId: string; courseId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this material? Students will no longer be able to download it.")) return;
    startTransition(async () => {
      try {
        await deleteMaterial(materialId, courseId);
        toast.success("Material deleted.");
      } catch {
        toast.error("Could not delete material.");
      }
    });
  }

  return (
    <Button size="sm" variant="destructive" onClick={handleClick} disabled={pending}>
      {pending ? "..." : "Delete"}
    </Button>
  );
}
