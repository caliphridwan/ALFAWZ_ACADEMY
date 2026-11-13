/** Small red number shown next to a button or link when something is waiting. */
export function CountBadge({ n, label }: { n: number; label: string }) {
  if (n <= 0) return null;
  return (
    <span
      className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-xs font-semibold leading-none text-destructive-foreground"
      aria-label={`${n} ${label}`}
      title={`${n} ${label}`}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}
