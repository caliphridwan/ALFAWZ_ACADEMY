type Stats = {
  studentsCount: number | null;
  countriesCount: number | null;
  classesDelivered: number | null;
};

/**
 * Section 7: all three figures are admin-set in /admin/settings rather than
 * computed from registered accounts — real students and alumni who studied
 * before this platform existed have no account here, so a live count would
 * always understate reality. Shown as "—" rather than a fabricated number
 * until an admin sets a value.
 */
export function StatsSection({ stats }: { stats: Stats | null }) {
  const items = [
    { label: "Students", value: stats?.studentsCount },
    { label: "Countries", value: stats?.countriesCount },
    { label: "Classes Delivered", value: stats?.classesDelivered },
  ];

  return (
    <section className="border-y border-border bg-muted/40">
      <div className="container py-12 grid grid-cols-3 gap-6 text-center">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-3xl sm:text-4xl font-bold text-brand">
              {item.value !== undefined && item.value !== null ? `${item.value}+` : "—"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
