import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { SponsorshipCalculator } from "@/components/sponsorship/calculator";
import { SponsorsList } from "@/components/sponsorship/sponsors-list";
import { Button } from "@/components/ui/button";
import { ExplainerVideo } from "@/components/marketing/explainer-video";
import { BankTransferDetails } from "@/components/payments/bank-transfer-details";
import { getBankTransferInfo } from "@/lib/bank-details";
import { formatCurrency } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Sponsor a Student",
  description:
    "Sponsor a student at AlFawz Academy and help make Islamic education accessible to those who could not otherwise afford it.",
};

export default async function SponsorPage() {
  const [settings, sponsorCount, bankInfo] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.sponsorship.count({ where: { status: "ACTIVE" } }),
    getBankTransferInfo(),
  ]);

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
      <div className="relative isolate max-w-2xl mx-auto text-center mb-14">
        {/* faded open Qur'an behind the heading */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/quran-rehal-watermark.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-[130%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-90 dark:opacity-20"
        />
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Sponsor a Student. Change a Life.
        </h1>
        <p className="text-muted-foreground">
          Many students cannot afford structured Islamic education on their
          own. Your sponsorship gives a student full access to AlFawz
          Academy&apos;s classes and teachers.
        </p>
      </div>

      <ExplainerVideo
        bare
        videoSrc="/videos/sponsor-explainer.mp4"
        posterSrc="/videos/sponsor-explainer-poster.jpg"
        eyebrow="Where your gift goes"
        title="See what your sponsorship makes possible"
        description="A short film on how a sponsored student learns, and how you follow their progress."
      />

      <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-16">
        {impactTiers.map((tier) => (
          <div key={tier.count} className="rounded-lg border border-border p-5 text-center">
            <p className="text-2xl font-bold text-brand mb-1">{tier.count} Student{tier.count > 1 ? "s" : ""}</p>
            <p className="text-xs text-muted-foreground mb-2">{tier.label}</p>
            <p className="text-sm font-medium">
              {formatCurrency(tier.count * pricePerStudent, undefined, currencySymbol)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(pricePerStudent, undefined, currencySymbol)} per student
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

      {bankInfo && (
        <div className="max-w-4xl mx-auto mt-8">
          <BankTransferDetails info={bankInfo} purpose="student sponsorship" />
        </div>
      )}

      {sponsorCount > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-8">Our Sponsors</h2>
          <SponsorsList limit={6} emptyState={false} />
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/sponsors">View All Sponsors</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
