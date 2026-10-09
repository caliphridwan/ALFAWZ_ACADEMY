"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Card, CardContent } from "@/components/ui/card";
import { createStudentByAdmin, type CreateStudentState } from "@/app/admin/students/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Creating..." : "Create Student"}</Button>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

export function AddStudentForm() {
  const [state, formAction] = useFormState(createStudentByAdmin, { success: false } as CreateStudentState);

  if (state.success && state.tempPassword) {
    return (
      <Card className="max-w-xl border-brand/30">
        <CardContent className="p-6">
          <h2 className="font-semibold text-brand mb-2">Student account created</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Share these details with the student. This password is shown only
            once and cannot be retrieved again — if lost, use the student's
            detail page to send a password reset instead. An email with these
            details was also sent automatically if email sending is configured.
          </p>
          <div className="rounded-md bg-muted/50 p-4 space-y-2 text-sm font-mono mb-4">
            <div className="flex items-center justify-between">
              <span>Email: {state.email}</span>
              {state.email && <CopyButton text={state.email} />}
            </div>
            <div className="flex items-center justify-between">
              <span>Password: {state.tempPassword}</span>
              <CopyButton text={state.tempPassword} />
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href={`/admin/students/${state.studentId}`}>Go to Student Record</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/students/new">Add Another</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state.formError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" required />
        <FieldError messages={state.fieldErrors?.name} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
        <FieldError messages={state.fieldErrors?.email} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" />
        </div>
        <div>
          <Label htmlFor="country">Country (optional)</Label>
          <Input id="country" name="country" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        A secure temporary password will be generated automatically and
        shown once you submit — there's nothing to type here for that.
      </p>
      <SubmitButton />
    </form>
  );
}
