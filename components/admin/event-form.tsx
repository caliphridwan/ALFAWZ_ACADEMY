"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { EventFormState } from "@/app/admin/events/actions";

type Defaults = {
  title: string;
  slug: string;
  description: string;
  date: string;
  time: string;
  location: string;
  speaker?: string | null;
  image?: string | null;
  published: boolean;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : label}</Button>;
}

export function EventForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (prevState: EventFormState, formData: FormData) => Promise<EventFormState>;
  defaults?: Partial<Defaults>;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, { success: false } as EventFormState);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state.formError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required defaultValue={defaults?.title} />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" required defaultValue={defaults?.slug} />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={defaults?.description}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" required defaultValue={defaults?.date} />
        </div>
        <div>
          <Label htmlFor="time">Time</Label>
          <Input id="time" name="time" required defaultValue={defaults?.time} placeholder="e.g. 7:00 PM WAT" />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" required defaultValue={defaults?.location} placeholder="Online / venue" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="speaker">Speaker</Label>
          <Input id="speaker" name="speaker" defaultValue={defaults?.speaker ?? ""} />
        </div>
        <div>
          <Label htmlFor="image">Image path</Label>
          <Input id="image" name="image" defaultValue={defaults?.image ?? ""} placeholder="/images/events/name.jpg" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={defaults?.published ?? true} className="rounded border-border" />
        Published (visible on site)
      </label>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
