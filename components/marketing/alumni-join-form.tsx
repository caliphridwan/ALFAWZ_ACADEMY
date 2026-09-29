"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { submitAlumniRegistration, type AlumniJoinState } from "@/app/(marketing)/alumni/join/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Submitting..." : "Submit for Review"}
    </Button>
  );
}

export function AlumniJoinForm({ programSuggestions }: { programSuggestions: string[] }) {
  const [state, formAction] = useFormState(submitAlumniRegistration, { success: false } as AlumniJoinState);

  if (state.success) {
    return (
      <div className="rounded-md bg-brand/10 border border-brand/20 px-5 py-8 text-center">
        <p className="font-medium text-brand mb-2">Submission received</p>
        <p className="text-sm text-muted-foreground">
          Jazakumullahu khairan. Our team will review your details, and your
          profile will appear on the Alumni page once approved.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.formError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" required />
          <FieldError messages={state.fieldErrors?.name} />
        </div>
        <div>
          <Label htmlFor="email">Email (kept private)</Label>
          <Input id="email" name="email" type="email" required />
          <FieldError messages={state.fieldErrors?.email} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="program">Program Completed</Label>
          <Input id="program" name="program" required list="program-options" />
          <datalist id="program-options">
            {programSuggestions.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <FieldError messages={state.fieldErrors?.program} />
        </div>
        <div>
          <Label htmlFor="graduationYear">Graduation Year</Label>
          <Input id="graduationYear" name="graduationYear" type="number" required />
          <FieldError messages={state.fieldErrors?.graduationYear} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currentRole">What you do now (optional)</Label>
          <Input id="currentRole" name="currentRole" />
        </div>
        <div>
          <Label htmlFor="location">Location (optional)</Label>
          <Input id="location" name="location" placeholder="City, Country" />
        </div>
      </div>

      <div>
        <Label htmlFor="story">Your Story</Label>
        <textarea
          id="story"
          name="story"
          required
          rows={5}
          placeholder="How did your time at AlFawz Academy shape your journey?"
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <FieldError messages={state.fieldErrors?.story} />
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="consent" className="mt-1 rounded border-border" />
          <span>
            I agree that my name, program, graduation year and story may be
            shown publicly on the Alumni page if approved. I am 18 or older, or
            a parent/guardian has agreed on my behalf.
          </span>
        </label>
        <FieldError messages={state.fieldErrors?.consent} />
      </div>

      <SubmitButton />
    </form>
  );
}
