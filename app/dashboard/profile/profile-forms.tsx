"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signOut } from "next-auth/react";
import { updateProfile, changePassword, type ProfileFormState } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const initial: ProfileFormState = { success: false };

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function ProfileForm({
  defaultValues,
}: {
  defaultValues: {
    name: string;
    email: string;
    phone: string | null;
    country: string | null;
    address?: string | null;
  };
}) {
  const [state, formAction] = useFormState(updateProfile, initial);
  const [emailValue, setEmailValue] = useState(defaultValues.email);
  const isChangingEmail = emailValue.trim().toLowerCase() !== defaultValues.email.toLowerCase();

  // Changing the login email invalidates trusting the current session, so
  // force a fresh sign-in with the new email rather than leave a stale one.
  useEffect(() => {
    if (state.success && state.emailChanged) {
      signOut({ callbackUrl: "/login" });
    }
  }, [state.success, state.emailChanged]);

  if (state.success && state.emailChanged) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-brand">
            Email updated. Signing you out so you can log back in with your new email...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-semibold mb-4">Personal Information</h2>
        <form action={formAction} className="space-y-4">
          {state.success && (
            <p className="text-sm text-brand">Profile updated successfully.</p>
          )}
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" defaultValue={defaultValues.name} />
          </div>
          <div>
            <Label htmlFor="email">Email (used to log in)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
            />
          </div>
          {isChangingEmail && (
            <div>
              <Label htmlFor="currentPasswordForEmailChange">
                Current Password <span className="text-muted-foreground font-normal">(required to change email)</span>
              </Label>
              <Input
                id="currentPasswordForEmailChange"
                name="currentPasswordForEmailChange"
                type="password"
                required
              />
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={defaultValues.phone ?? ""} />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue={defaultValues.country ?? ""} />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={defaultValues.address ?? ""} />
          </div>
          <SaveButton label="Save Changes" />
        </form>
      </CardContent>
    </Card>
  );
}

export function PasswordForm() {
  const [state, formAction] = useFormState(changePassword, initial);

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-semibold mb-4">Change Password</h2>
        <form action={formAction} className="space-y-4">
          {state.success && <p className="text-sm text-brand">Password changed successfully.</p>}
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" name="newPassword" type="password" required minLength={8} />
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input id="confirmNewPassword" name="confirmNewPassword" type="password" required minLength={8} />
            </div>
          </div>
          <SaveButton label="Change Password" />
        </form>
      </CardContent>
    </Card>
  );
}
