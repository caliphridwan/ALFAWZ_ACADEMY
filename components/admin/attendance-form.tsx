"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { saveAttendance, type AttendanceFormState } from "@/app/admin/courses/[id]/sessions/actions";

type Row = { studentId: string; name: string; current: "PRESENT" | "ABSENT" | "EXCUSED" | null };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Attendance"}
    </Button>
  );
}

export function AttendanceForm({ sessionId, rows }: { sessionId: string; rows: Row[] }) {
  const [state, formAction] = useFormState(saveAttendance, { success: false } as AttendanceFormState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="sessionId" value={sessionId} />

      {state.formError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}
      {state.success && (
        <div className="rounded-md bg-brand/10 border border-brand/20 px-4 py-3 text-sm text-brand">
          Attendance saved ({state.saved} marked).
        </div>
      )}

      <div className="rounded-lg border border-border divide-y divide-border">
        {rows.map((r) => (
          <div key={r.studentId} className="flex items-center justify-between gap-4 p-3">
            <span className="text-sm font-medium">{r.name}</span>
            <select
              name={`status_${r.studentId}`}
              defaultValue={r.current ?? ""}
              className="h-10 rounded-md border border-input bg-background px-2 text-sm"
              aria-label={`Attendance for ${r.name}`}
            >
              <option value="">Not marked</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="EXCUSED">Excused</option>
            </select>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No actively enrolled students in this course yet.
          </p>
        )}
      </div>

      {rows.length > 0 && <SaveButton />}
    </form>
  );
}
