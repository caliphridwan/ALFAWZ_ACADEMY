"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import type { MaterialFormState } from "@/app/admin/courses/[id]/materials/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Adding..." : "Add Material"}</Button>;
}

export function MaterialForm({
  action,
}: {
  action: (prevState: MaterialFormState, formData: FormData) => Promise<MaterialFormState>;
}) {
  const [state, formAction] = useFormState(action, { success: false } as MaterialFormState);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="e.g. Week 3 Tajweed Notes" />
        <FieldError messages={state.fieldErrors?.title} />
      </div>
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Input id="description" name="description" placeholder="Short note about this file" />
      </div>
      <div>
        <Label htmlFor="fileUrl">File URL</Label>
        <Input
          id="fileUrl"
          name="fileUrl"
          required
          placeholder="https://res.cloudinary.com/your-cloud/raw/upload/.../notes.pdf"
        />
        <FieldError messages={state.fieldErrors?.fileUrl} />
      </div>
      <SubmitButton />
    </form>
  );
}
