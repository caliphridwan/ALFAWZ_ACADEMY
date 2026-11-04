// The academy runs on West Africa Time (UTC+1, no daylight saving). Admin
// forms use <input type="datetime-local">, which has no timezone — and the
// server (Render) runs in UTC, so parsing the raw string there shifts every
// time by an hour. These helpers pin the interpretation to WAT instead.

export const ACADEMY_TIME_ZONE = "Africa/Lagos";
const WAT_OFFSET = "+01:00";

/** "YYYY-MM-DDTHH:mm" (as typed in WAT) -> the correct instant, or null. */
export function parseAcademyDateTime(value?: string | null): Date | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(v);
  const iso = hasZone ? v : `${v.length === 16 ? `${v}:00` : v}${WAT_OFFSET}`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** An instant -> "YYYY-MM-DDTHH:mm" in WAT, for a datetime-local input. */
export function toAcademyInputValue(date?: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ACADEMY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Human-readable date + time in WAT, e.g. "Thursday, 5 November 2026, 19:00". */
export function formatAcademyDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: ACADEMY_TIME_ZONE,
  });
}

export function formatAcademyDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    dateStyle: "long",
    timeZone: ACADEMY_TIME_ZONE,
  });
}

export function formatAcademyTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-GB", {
    timeStyle: "short",
    timeZone: ACADEMY_TIME_ZONE,
  });
}
