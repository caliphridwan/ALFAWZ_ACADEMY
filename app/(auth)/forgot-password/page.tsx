"use client";

import { useFormState, useFormStatus } from "react-dom";
import { requestPasswordReset, type SimpleFormState } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialState: SimpleFormState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Sending..." : "Send Reset Link"}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(requestPasswordReset, initialState);

  return (
    <div className="container py-20 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-1">Forgot your password?</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {state.success ? (
        <div className="rounded-md bg-brand/10 border border-brand/20 px-5 py-6 text-sm text-brand">
          If an account exists for that email, a reset link is on its way. Please check your inbox.
        </div>
      ) : (
        <form action={formAction} className="space-y-5">
          {state.error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <SubmitButton />
        </form>
      )}
    </div>
  );
}
