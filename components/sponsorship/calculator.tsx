"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/cn";
import { toast } from "sonner";

const QUICK_PICKS = [1, 5, 10];

export function SponsorshipCalculator({
  pricePerStudent,
  currencySymbol,
  minStudents,
  maxStudents,
}: {
  pricePerStudent: number;
  currencySymbol: string;
  minStudents: number;
  maxStudents: number;
}) {
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => count * pricePerStudent, [count, pricePerStudent]);

  function setCountClamped(n: number) {
    setCount(Math.min(maxStudents, Math.max(minStudents, n)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const payload = {
      fullName: form.get("fullName"),
      email: form.get("email"),
      phone: form.get("phone"),
      country: form.get("country"),
      numberOfStudents: count,
      duration: form.get("duration"),
      message: form.get("message") || undefined,
      showPublicly: form.get("showPublicly") === "on",
      publicName: form.get("publicName") || undefined,
    };

    try {
      const res = await fetch("/api/sponsorship/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please check your details.");
        setLoading(false);
        return;
      }

      window.location.href = data.authorizationUrl;
    } catch {
      toast.error("Network error — please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">How many students would you like to sponsor?</h3>

        <div className="flex items-center gap-4 mb-4">
          <button
            type="button"
            onClick={() => setCountClamped(count - 1)}
            className="h-11 w-11 rounded-full border border-border flex items-center justify-center hover:bg-muted"
            aria-label="Decrease"
          >
            <Minus size={18} />
          </button>
          <Input
            type="number"
            value={count}
            min={minStudents}
            max={maxStudents}
            onChange={(e) => setCountClamped(Number(e.target.value) || minStudents)}
            className="text-center text-lg font-semibold"
          />
          <button
            type="button"
            onClick={() => setCountClamped(count + 1)}
            className="h-11 w-11 rounded-full border border-border flex items-center justify-center hover:bg-muted"
            aria-label="Increase"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {QUICK_PICKS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCountClamped(n)}
              className="text-xs rounded-full border border-border px-3 py-1.5 hover:bg-muted"
            >
              {n} Student{n > 1 ? "s" : ""}
            </button>
          ))}
        </div>

        <div className="rounded-lg bg-brand/5 p-4 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {count} × {formatCurrency(pricePerStudent, undefined, currencySymbol)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold text-brand">
            <span>Total</span>
            <span>{formatCurrency(total, undefined, currencySymbol)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-semibold mb-2">Your Information</h3>
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" name="fullName" required />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" required />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" required />
          </div>
          <div>
            <Label htmlFor="duration">Sponsorship Duration</Label>
            <select
              id="duration"
              name="duration"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
              required
            >
              <option value="1 month">1 month</option>
              <option value="3 months">3 months</option>
              <option value="6 months">6 months</option>
              <option value="12 months">12 months</option>
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="message">Message (optional)</Label>
          <Input id="message" name="message" />
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="showPublicly" className="mt-1 rounded border-border" />
          <span>I would like my name displayed publicly on the Sponsors page.</span>
        </label>
        <div>
          <Label htmlFor="publicName">Public display name (optional)</Label>
          <Input id="publicName" name="publicName" placeholder="Leave blank to use your full name" />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Preparing checkout..." : "Sponsor Students with Paystack"}
        </Button>
      </form>
    </div>
  );
}
