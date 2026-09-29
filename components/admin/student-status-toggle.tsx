"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setStudentActive } from "@/app/admin/students/actions";

export function StudentStatusToggle({ studentId, isActive }: { studentId: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      try {
        await setStudentActive(studentId, !isActive);
        toast.success(isActive ? "Student deactivated." : "Student activated.");
      } catch {
        toast.error("Could not update student status.");
      }
    });
  }

  return (
    <Button variant={isActive ? "destructive" : "default"} size="sm" onClick={toggle} disabled={pending}>
      {pending ? "Updating..." : isActive ? "Deactivate Account" : "Activate Account"}
    </Button>
  );
}
