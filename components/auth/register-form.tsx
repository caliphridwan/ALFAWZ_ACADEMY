"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { registerStudent, type RegisterFormState } from "@/app/(auth)/register/actions";

const MINOR_AGE_THRESHOLD = 18;

const initialState: RegisterFormState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account..." : "Create Account"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useFormState(registerStudent, initialState);
  const [dob, setDob] = useState("");

  const age = dob
    ? Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;
  const showGuardianFields = age !== null && age < MINOR_AGE_THRESHOLD;

  if (state.success) {
    return (
      <div className="rounded-md bg-brand/10 border border-brand/20 px-5 py-6 text-center">
        <p className="font-medium text-brand mb-2">Account created successfully!</p>
        <p className="text-sm text-muted-foreground mb-4">
          You can now sign in and start exploring courses.
        </p>
        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {state.formError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}

      <fieldset className="space-y-4">
        <legend className="font-semibold mb-2">Student Information</legend>
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" name="fullName" required />
          <FieldError messages={state.fieldErrors?.fullName} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            <FieldError messages={state.fieldErrors?.dateOfBirth} />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              name="gender"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
              defaultValue="UNSPECIFIED"
            >
              <option value="UNSPECIFIED">Prefer not to say</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" required />
            <FieldError messages={state.fieldErrors?.country} />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" type="tel" required />
            <FieldError messages={state.fieldErrors?.phone} />
          </div>
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" />
        </div>
      </fieldset>

      {showGuardianFields && (
        <fieldset className="space-y-4 rounded-md border border-gold/30 bg-gold/5 p-4">
          <legend className="font-semibold mb-2 px-1">
            Parent / Guardian Information
            <span className="block text-xs font-normal text-muted-foreground mt-1">
              Required for students under 18
            </span>
          </legend>
          <div>
            <Label htmlFor="guardian.name">Guardian Name</Label>
            <Input id="guardian.name" name="guardian.name" required={showGuardianFields} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guardian.email">Guardian Email</Label>
              <Input
                id="guardian.email"
                name="guardian.email"
                type="email"
                required={showGuardianFields}
              />
            </div>
            <div>
              <Label htmlFor="guardian.phone">Guardian Phone</Label>
              <Input id="guardian.phone" name="guardian.phone" type="tel" required={showGuardianFields} />
            </div>
          </div>
          <div>
            <Label htmlFor="guardian.relationship">Relationship to Student</Label>
            <Input
              id="guardian.relationship"
              name="guardian.relationship"
              placeholder="e.g. Mother, Father, Uncle"
              required={showGuardianFields}
            />
          </div>
          <FieldError messages={state.fieldErrors?.guardian} />
        </fieldset>
      )}

      <fieldset className="space-y-4">
        <legend className="font-semibold mb-2">Educational Information</legend>
        <div>
          <Label htmlFor="previousQuranKnowledge">Previous Qur&apos;an Knowledge</Label>
          <Input id="previousQuranKnowledge" name="previousQuranKnowledge" />
        </div>
        <div>
          <Label htmlFor="preferredClassTime">Preferred Class Time</Label>
          <Input id="preferredClassTime" name="preferredClassTime" placeholder="e.g. Weekday evenings" />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-semibold mb-2">Account</legend>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
          <FieldError messages={state.fieldErrors?.email} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={8} />
            <FieldError messages={state.fieldErrors?.password} />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
            <FieldError messages={state.fieldErrors?.confirmPassword} />
          </div>
        </div>
      </fieldset>

      <SubmitButton />
    </form>
  );
}
