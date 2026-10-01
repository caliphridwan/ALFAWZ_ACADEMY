"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { submitContactMessage, type ContactFormState } from "@/app/(marketing)/contact/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Sending..." : "Send Message"}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useFormState(submitContactMessage, { success: false } as ContactFormState);

  if (state.success) {
    return (
      <div className="rounded-md bg-brand/10 border border-brand/20 px-5 py-8 text-center">
        <p className="font-medium text-brand mb-2">Message sent</p>
        <p className="text-sm text-muted-foreground">
          Jazakallahu khairan for reaching out — we&apos;ll get back to you soon.
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
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
          <FieldError messages={state.fieldErrors?.name} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
          <FieldError messages={state.fieldErrors?.email} />
        </div>
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required />
        <FieldError messages={state.fieldErrors?.subject} />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <FieldError messages={state.fieldErrors?.message} />
      </div>
      <SubmitButton />
    </form>
  );
}
