"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function getRemaining(closesAt: string) {
  const diff = new Date(closesAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/**
 * closesAt is passed as an ISO string (not a Date) so this can safely be a
 * small client component — ticks every second, and calls onClose once the
 * deadline passes so the parent can hide/disable the Enroll button without
 * needing its own timer.
 */
export function RegistrationCountdown({
  closesAt,
  onClose,
}: {
  closesAt: string;
  onClose?: () => void;
}) {
  const [remaining, setRemaining] = useState(() => getRemaining(closesAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getRemaining(closesAt);
      setRemaining(next);
      if (!next) {
        clearInterval(interval);
        onClose?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [closesAt, onClose]);

  if (!remaining) {
    return (
      <p className="flex items-center gap-2 text-sm text-destructive font-medium">
        <Clock size={16} />
        Registration closed
      </p>
    );
  }

  const units = [
    { label: "Days", value: remaining.days },
    { label: "Hours", value: remaining.hours },
    { label: "Min", value: remaining.minutes },
    { label: "Sec", value: remaining.seconds },
  ];

  return (
    <div>
      <p className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Clock size={16} className="text-brand" />
        Registration closes in:
      </p>
      <div className="flex gap-2">
        {units.map((u) => (
          <div key={u.label} className="rounded-md bg-muted px-3 py-2 text-center min-w-[52px]">
            <p className="text-lg font-bold text-brand tabular-nums">{String(u.value).padStart(2, "0")}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{u.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
