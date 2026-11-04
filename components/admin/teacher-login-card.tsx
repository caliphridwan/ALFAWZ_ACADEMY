"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createTeacherLogin, type TeacherLoginState } from "@/app/admin/teachers/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Creating..." : "Create login & email invite"}
    </Button>
  );
}

export function TeacherLoginCard({ teacherId, loginEmail }: { teacherId: string; loginEmail: string | null }) {
  const action = createTeacherLogin.bind(null, teacherId);
  const [state, formAction] = useFormState(action, { success: false } as TeacherLoginState);

  return (
    <div className="mt-10 max-w-xl rounded-lg border border-border p-5">
      <h2 className="font-semibold">Teacher login</h2>
      {loginEmail ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Signs in with <span className="font-medium text-foreground">{loginEmail}</span> and sees only the
          courses they teach at <span className="font-mono">/teacher</span>. If they forget their password they can
          use “Forgot password” on the login page.
        </p>
      ) : (
        <form action={formAction} className="mt-3 space-y-3">
          <p className="text-sm text-muted-foreground">
            Let this teacher sign in to mark attendance, add class recordings and review students&apos; recitations
            for the courses assigned to them. We email them a link to choose a password.
          </p>
          {state.error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}
          {state.success && !state.error && (
            <div className="rounded-md bg-brand/10 border border-brand/20 px-3 py-2 text-sm text-brand">
              Invite sent to {state.email}.
            </div>
          )}
          <div>
            <Label htmlFor="teacherEmail">Teacher&apos;s email</Label>
            <Input id="teacherEmail" name="email" type="email" required />
          </div>
          <SubmitButton />
        </form>
      )}
    </div>
  );
}
