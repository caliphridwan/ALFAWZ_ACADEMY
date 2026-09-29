"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { TestimonialFormState } from "@/app/admin/testimonials/actions";

type Defaults = {
  name: string;
  country?: string | null;
  content: string;
  course?: string | null;
  image?: string | null;
  published: boolean;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : label}</Button>;
}

export function TestimonialForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (prevState: TestimonialFormState, formData: FormData) => Promise<TestimonialFormState>;
  defaults?: Partial<Defaults>;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, { success: false } as TestimonialFormState);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state.formError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Student Name</Label>
          <Input id="name" name="name" required defaultValue={defaults?.name} />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={defaults?.country ?? ""} />
        </div>
      </div>
      <div>
        <Label htmlFor="content">Testimonial</Label>
        <textarea
          id="content"
          name="content"
          required
          rows={4}
          defaultValue={defaults?.content}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="course">Course</Label>
          <Input id="course" name="course" defaultValue={defaults?.course ?? ""} />
        </div>
        <div>
          <Label htmlFor="image">Photo path</Label>
          <Input id="image" name="image" defaultValue={defaults?.image ?? ""} placeholder="/images/testimonials/name.jpg" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={defaults?.published ?? false} className="rounded border-border" />
        Published (visible on site)
      </label>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
