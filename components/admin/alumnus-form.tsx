"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { AlumnusFormState } from "@/app/admin/alumni/actions";

type Defaults = {
  name: string;
  photo?: string | null;
  graduationYear: number;
  program: string;
  currentRole?: string | null;
  location?: string | null;
  story: string;
  linkedinUrl?: string | null;
  featured: boolean;
  published: boolean;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : label}</Button>;
}

export function AlumnusForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (prevState: AlumnusFormState, formData: FormData) => Promise<AlumnusFormState>;
  defaults?: Partial<Defaults>;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, { success: false } as AlumnusFormState);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state.formError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required defaultValue={defaults?.name} />
        </div>
        <div>
          <Label htmlFor="graduationYear">Graduation Year</Label>
          <Input
            id="graduationYear"
            name="graduationYear"
            type="number"
            required
            defaultValue={defaults?.graduationYear}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="program">Program Completed</Label>
        <Input id="program" name="program" required defaultValue={defaults?.program} placeholder="e.g. Tahfeezul Qur'an" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currentRole">Current Role / What they do now</Label>
          <Input id="currentRole" name="currentRole" defaultValue={defaults?.currentRole ?? ""} />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={defaults?.location ?? ""} />
        </div>
      </div>

      <div>
        <Label htmlFor="story">Their Story</Label>
        <textarea
          id="story"
          name="story"
          required
          rows={5}
          defaultValue={defaults?.story}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="photo">Photo URL</Label>
          <Input id="photo" name="photo" defaultValue={defaults?.photo ?? ""} placeholder="https://res.cloudinary.com/your-cloud/image/upload/.../alumni-name.jpg" />
        </div>
        <div>
          <Label htmlFor="linkedinUrl">LinkedIn URL (optional)</Label>
          <Input id="linkedinUrl" name="linkedinUrl" defaultValue={defaults?.linkedinUrl ?? ""} placeholder="https://linkedin.com/in/..." />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={defaults?.published ?? false} className="rounded border-border" />
          Published (visible on site)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={defaults?.featured ?? false} className="rounded border-border" />
          Featured (pinned to top)
        </label>
      </div>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
