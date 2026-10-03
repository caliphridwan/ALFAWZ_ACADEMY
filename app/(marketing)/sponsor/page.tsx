import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { SponsorshipCalculator } from "@/components/sponsorship/calculator";
import { formatCurrency } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Sponsor a Student",
  description:
    "Sponsor a student at AlFawz Academy and help make Islamic education accessible to those who could not otherwise afford it.",
};

export default async function SponsorPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  const pricePerStudent = Number(settings?.sponsorshipPrice ?? 30000);
  const currencySymbol = settings?.currencySymbol ?? "₦";
  const minStudents = settings?.minSponsorStudents ?? 1;
  const maxStudents = settings?.maxSponsorStudents ?? 100;

  const impactTiers = [
    { count: 1, label: "Providing Islamic education to one learner" },
    { count: 5, label: "Supporting a small group of learners" },
    { count: 10, label: "Creating a wider educational impact" },
  ];

  return (
    <div className="container py-16">
      <div className="max-w-2xl mx-auto text-center mb-14">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Sponsor a Student. Change a Life.
        </h1>
        <p className="text-muted-foreground">
          Many students cannot afford structured Islamic education on their
          own. Your sponsorship gives a student full access to AlFawz
          Academy&apos;s classes and teachers.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-16">
        {impactTiers.map((tier) => (
          <div key={tier.count} className="rounded-lg border border-border p-5 text-center">
            <p className="text-2xl font-bold text-brand mb-1">{tier.count} Student{tier.count > 1 ? "s" : ""}</p>
            <p className="text-xs text-muted-foreground mb-2">{tier.label}</p>
            <p className="text-sm font-medium">
              {formatCurrency(tier.count * pricePerStudent, undefined, currencySymbol)}
              <span className="text-muted-foreground font-normal">/cohort</span>
            </p>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        <SponsorshipCalculator
          pricePerStudent={pricePerStudent}
          currencySymbol={currencySymbol}
          minStudents={minStudents}
          maxStudents={maxStudents}
        />
      </div>
    </div>
  );
}
