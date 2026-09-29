"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { updateSiteSettings, type SettingsFormState } from "@/app/admin/settings/actions";

type Defaults = {
  sponsorshipPrice: number;
  currency: string;
  currencySymbol: string;
  minSponsorStudents: number;
  maxSponsorStudents: number;
  whatsappNumber?: string | null;
  contactEmail?: string | null;
  phoneNumber?: string | null;
};

function SaveButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Settings"}</Button>;
}

export function SettingsForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction] = useFormState(updateSiteSettings, { success: false } as SettingsFormState);

  return (
    <form action={formAction} className="space-y-6 max-w-xl">
      {state.success && (
        <div className="rounded-md bg-brand/10 border border-brand/20 px-4 py-3 text-sm text-brand">
          Settings saved — changes are live across the site immediately.
        </div>
      )}

      <fieldset className="space-y-4">
        <legend className="font-semibold mb-2">Sponsorship</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sponsorshipPrice">Price per student (per month)</Label>
            <Input id="sponsorshipPrice" name="sponsorshipPrice" type="number" step="0.01" required defaultValue={defaults.sponsorshipPrice} />
            <FieldError messages={state.fieldErrors?.sponsorshipPrice} />
          </div>
          <div>
            <Label htmlFor="currencySymbol">Currency Symbol</Label>
            <Input id="currencySymbol" name="currencySymbol" required defaultValue={defaults.currencySymbol} />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="currency">Currency Code</Label>
            <Input id="currency" name="currency" required defaultValue={defaults.currency} />
          </div>
          <div>
            <Label htmlFor="minSponsorStudents">Min Students</Label>
            <Input id="minSponsorStudents" name="minSponsorStudents" type="number" required defaultValue={defaults.minSponsorStudents} />
          </div>
          <div>
            <Label htmlFor="maxSponsorStudents">Max Students</Label>
            <Input id="maxSponsorStudents" name="maxSponsorStudents" type="number" required defaultValue={defaults.maxSponsorStudents} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-semibold mb-2">Contact</legend>
        <div>
          <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
          <Input id="whatsappNumber" name="whatsappNumber" defaultValue={defaults.whatsappNumber ?? ""} placeholder="+234..." />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={defaults.contactEmail ?? ""} />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" name="phoneNumber" defaultValue={defaults.phoneNumber ?? ""} />
          </div>
        </div>
      </fieldset>

      <SaveButton />
    </form>
  );
}
