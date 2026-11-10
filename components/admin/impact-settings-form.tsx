"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { saveImpactSettings } from "@/app/admin/sponsors/actions";
import type { ImpactOverrides } from "@/lib/sponsor-impact";

type Auto = {
  supported: number;
  completed: number;
  certificates: number | null;
  attendancePct: number | null;
  recitationAvg: number | null;
  passRatePct: number | null;
};

const FIELDS: { key: keyof Omit<ImpactOverrides, "note">; autoKey: keyof Auto; label: string; unit?: string; step?: string }[] = [
  { key: "supportedOverride", autoKey: "supported", label: "Students supported by the fund" },
  { key: "completedOverride", autoKey: "completed", label: "Courses completed" },
  { key: "certificatesOverride", autoKey: "certificates", label: "Certificates earned" },
  { key: "attendanceOverride", autoKey: "attendancePct", label: "Average class attendance", unit: "%" },
  { key: "recitationOverride", autoKey: "recitationAvg", label: "Average recitation rating", unit: "/ 5", step: "0.1" },
  { key: "passRateOverride", autoKey: "passRatePct", label: "Passed their assessments", unit: "%" },
];

export function ImpactSettingsForm({ overrides, auto }: { overrides: ImpactOverrides; auto: Auto }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, overrides[f.key] === null ? "" : String(overrides[f.key])]))
  );
  const [note, setNote] = useState(overrides.note ?? "");
  const [pending, startTransition] = useTransition();

  const num = (v: string) => (v.trim() === "" ? null : Number(v));

  function save() {
    const parsed = Object.fromEntries(FIELDS.map((f) => [f.key, num(values[f.key])])) as Record<string, number | null>;
    if (Object.values(parsed).some((v) => v !== null && Number.isNaN(v))) {
      toast.error("Please enter numbers only.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await saveImpactSettings({ ...(parsed as any), note });
        if (res.ok) toast.success("Saved. Sponsors will see these figures.");
        else toast.error(res.error ?? "Could not save.");
      } catch {
        toast.error("Could not save.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5 space-y-4">
          {FIELDS.map((f) => {
            const a = auto[f.autoKey];
            return (
              <div key={f.key} className="grid gap-1 sm:grid-cols-[1fr_180px] sm:items-center">
                <label htmlFor={f.key} className="text-sm font-medium">
                  {f.label}
                  <span className="block text-xs font-normal text-muted-foreground">
                    Automatic: {a === null ? "not enough data yet" : `${a}${f.unit && f.unit !== "/ 5" ? f.unit : f.unit ? ` ${f.unit}` : ""}`}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={f.key}
                    type="number"
                    min={0}
                    step={f.step ?? "1"}
                    inputMode="decimal"
                    value={values[f.key]}
                    placeholder={a === null ? "—" : String(a)}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                  {f.unit && <span className="text-sm text-muted-foreground">{f.unit}</span>}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <label htmlFor="note" className="text-sm font-medium">
            Message to sponsors (optional)
            <span className="block text-xs font-normal text-muted-foreground">Shown on their page and in the email, under the figures.</span>
          </label>
          <textarea
            id="note"
            rows={4}
            maxLength={2000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </CardContent>
      </Card>

      <Button onClick={save} disabled={pending}>
        {pending ? "Saving…" : "Save figures"}
      </Button>
    </div>
  );
}
