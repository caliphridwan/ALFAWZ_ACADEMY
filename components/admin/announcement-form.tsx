"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { sendAnnouncement, type AnnouncementFormState } from "@/app/admin/announcements/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending..." : "Send announcement"}
    </Button>
  );
}

export function AnnouncementForm({ courses }: { courses: { id: string; title: string }[] }) {
  const [state, formAction] = useFormState(sendAnnouncement, { success: false } as AnnouncementFormState);

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      {state.formError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}
      {state.success && (
        <div className="rounded-md bg-brand/10 border border-brand/20 px-4 py-3 text-sm text-brand">
          Sent to {state.recipients} {state.recipients === 1 ? "student" : "students"}.
        </div>
      )}

      <div>
        <Label htmlFor="courseId">Send to</Label>
        <select
          id="courseId"
          name="courseId"
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          defaultValue=""
        >
          <option value="">All actively enrolled students</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              Students of: {c.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required maxLength={120} placeholder="e.g. Class moved to 8pm this Friday" />
        <FieldError messages={state.fieldErrors?.title} />
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={2000}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <FieldError messages={state.fieldErrors?.message} />
      </div>

      <p className="text-xs text-muted-foreground">
        Students get this by email and in their dashboard notifications, plus a phone notification if they turned
        those on. It can&apos;t be unsent, so check it first.
      </p>

      <SubmitButton />
    </form>
  );
}
