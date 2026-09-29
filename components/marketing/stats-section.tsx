type Stats = {
  studentsCount: number;
  countriesCount: number;
  classesDelivered: number;
};

/**
 * Section 7: these figures come straight from SiteSettings (admin-editable)
 * — never fabricated placeholders. If an admin hasn't set them yet, we show
 * "—" rather than inventing a number.
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
