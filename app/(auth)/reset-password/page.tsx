"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { resetPassword, type SimpleFormState } from "../forgot-password/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialState: SimpleFormState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Resetting..." : "Reset Password"}
    </Button>
  );
}

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";
  const [state, formAction] = useFormState(resetPassword, initialState);

  if (state.success) {
    return (
      <div className="rounded-md bg-brand/10 border border-brand/20 px-5 py-6 text-center">
        <p className="font-medium text-brand mb-4">Your password has been reset.</p>
        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  if (!token || !email) {
    return (
      <p className="text-sm text-destructive">
        This reset link is missing required information. Please request a new one.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />
      {state.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      <div>
        <Label htmlFor="password">New Password</Label>
        <Input id="password" name="password" type="password" required minLength={8} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
      </div>
      <SubmitButton />
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="container py-20 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-1">Reset your password</h1>
      <p className="text-muted-foreground mb-8 text-sm">Choose a new password below.</p>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
