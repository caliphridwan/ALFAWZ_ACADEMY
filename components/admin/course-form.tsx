"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import type { CourseFormState } from "@/app/admin/courses/actions";

type Teacher = { id: string; name: string };
type CourseDefaults = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  schedule?: string | null;
  level: string;
  ageGroup: string;
  category?: string | null;
  instructorId?: string | null;
  image?: string | null;
  active: boolean;
  enrollmentOpen: boolean;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function CourseForm({
  action,
  teachers,
  defaults,
  submitLabel,
}: {
  action: (prevState: CourseFormState, formData: FormData) => Promise<CourseFormState>;
  teachers: Teacher[];
  defaults?: Partial<CourseDefaults>;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, { success: false } as CourseFormState);

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {state.formError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}
      {state.success && (
        <div className="rounded-md bg-brand/10 border border-brand/20 px-4 py-3 text-sm text-brand">
          Course saved successfully.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required defaultValue={defaults?.title} />
          <FieldError messages={state.fieldErrors?.title} />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" required defaultValue={defaults?.slug} placeholder="e.g. beginners-quran" />
          <FieldError messages={state.fieldErrors?.slug} />
        </div>
      </div>

      <div>
        <Label htmlFor="shortDescription">Short Description</Label>
        <Input id="shortDescription" name="shortDescription" required defaultValue={defaults?.shortDescription} />
        <FieldError messages={state.fieldErrors?.shortDescription} />
      </div>

      <div>
        <Label htmlFor="description">Full Description</Label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={defaults?.description}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <FieldError messages={state.fieldErrors?.description} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" type="number" step="0.01" required defaultValue={defaults?.price} />
          <FieldError messages={state.fieldErrors?.price} />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" name="currency" defaultValue={defaults?.currency ?? "NGN"} />
        </div>
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input id="duration" name="duration" required defaultValue={defaults?.duration} placeholder="e.g. 12 weeks" />
          <FieldError messages={state.fieldErrors?.duration} />
        </div>
      </div>

      <div>
        <Label htmlFor="schedule">Class Schedule</Label>
        <Input id="schedule" name="schedule" defaultValue={defaults?.schedule ?? ""} placeholder="e.g. Mon/Wed/Fri, 7:00 PM WAT" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="level">Level</Label>
          <Input id="level" name="level" required defaultValue={defaults?.level} />
          <FieldError messages={state.fieldErrors?.level} />
        </div>
        <div>
          <Label htmlFor="ageGroup">Age Group</Label>
          <Input id="ageGroup" name="ageGroup" required defaultValue={defaults?.ageGroup} />
          <FieldError messages={state.fieldErrors?.ageGroup} />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={defaults?.category ?? ""} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="instructorId">Instructor</Label>
          <select
            id="instructorId"
            name="instructorId"
            defaultValue={defaults?.instructorId ?? ""}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">No instructor assigned</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="image">Image URL</Label>
          <Input id="image" name="image" defaultValue={defaults?.image ?? ""} placeholder="https://res.cloudinary.com/your-cloud/image/upload/.../course-name.jpg" />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={defaults?.active ?? true} className="rounded border-border" />
          Active (visible in catalogue)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="enrollmentOpen"
            defaultChecked={defaults?.enrollmentOpen ?? true}
            className="rounded border-border"
          />
          Enrollment open
        </label>
      </div>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
