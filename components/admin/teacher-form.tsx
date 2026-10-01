"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { TeacherFormState } from "@/app/admin/teachers/actions";

type Defaults = {
  name: string;
  qualification?: string | null;
  specialization?: string | null;
  biography?: string | null;
  photo?: string | null;
  active: boolean;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : label}</Button>;
}

export function TeacherForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (prevState: TeacherFormState, formData: FormData) => Promise<TeacherFormState>;
  defaults?: Partial<Defaults>;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, { success: false } as TeacherFormState);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state.formError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={defaults?.name} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="qualification">Qualification</Label>
          <Input id="qualification" name="qualification" defaultValue={defaults?.qualification ?? ""} />
        </div>
        <div>
          <Label htmlFor="specialization">Specialization</Label>
          <Input id="specialization" name="specialization" defaultValue={defaults?.specialization ?? ""} />
        </div>
      </div>
      <div>
        <Label htmlFor="biography">Biography</Label>
        <textarea
          id="biography"
          name="biography"
          rows={4}
          defaultValue={defaults?.biography ?? ""}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="photo">Photo URL</Label>
        <Input id="photo" name="photo" defaultValue={defaults?.photo ?? ""} placeholder="https://res.cloudinary.com/your-cloud/image/upload/.../teacher-name.jpg" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={defaults?.active ?? true} className="rounded border-border" />
        Active (visible on site)
      </label>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
