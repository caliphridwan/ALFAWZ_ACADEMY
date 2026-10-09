"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { enrollStudentManually, type ManualEnrollmentState } from "@/app/admin/students/actions";

type CourseOption = { id: string; title: string; price: number; currency: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Enrolling..." : "Confirm Enrollment"}</Button>;
}

export function ManualEnrollmentForm({
  studentId,
  courses,
}: {
  studentId: string;
  courses: CourseOption[];
}) {
  const action = enrollStudentManually.bind(null, studentId);
  const [state, formAction] = useFormState(action, { success: false } as ManualEnrollmentState);

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      {state.formError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}
      {state.success && (
        <div className="rounded-md bg-brand/10 border border-brand/20 px-4 py-3 text-sm text-brand">
          Enrollment confirmed — the student has been notified.
        </div>
      )}

      <div>
        <Label htmlFor="courseId">Course</Label>
        <select
          id="courseId"
          name="courseId"
          required
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Select a course...</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} ({c.currency} {Number(c.price).toLocaleString()})
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>Reason</Label>
        <div className="flex gap-6 mt-1">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="reason" value="SCHOLARSHIP" required className="accent-brand" />
            Scholarship (free)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="reason" value="OFFLINE_PAYMENT" required className="accent-brand" />
            Paid Offline (counts as revenue)
          </label>
        </div>
      </div>

      <div>
        <Label htmlFor="note">Note (optional)</Label>
        <textarea
          id="note"
          name="note"
          rows={2}
          placeholder="e.g. Paid ₦15,000 cash on 10 Oct, receipt #..."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
