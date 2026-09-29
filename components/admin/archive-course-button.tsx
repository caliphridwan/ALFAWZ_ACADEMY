"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { archiveCourse } from "@/app/admin/courses/actions";

export function ArchiveCourseButton({ courseId }: { courseId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Archive this course? It will be hidden from the public catalogue and closed to new enrollments.")) {
      return;
    }
    startTransition(async () => {
      try {
        await archiveCourse(courseId);
        toast.success("Course archived.");
      } catch {
        toast.error("Could not archive course.");
      }
    });
  }

  return (
    <Button size="sm" variant="destructive" onClick={handleClick} disabled={pending}>
      {pending ? "Archiving..." : "Archive"}
    </Button>
  );
}
