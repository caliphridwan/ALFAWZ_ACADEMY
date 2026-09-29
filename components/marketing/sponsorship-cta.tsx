import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SponsorshipCta() {
  return (
    <section className="bg-brand text-brand-foreground">
      <div className="container py-20 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Your Support Can Change a Student&apos;s Future
        </h2>
        <p className="text-brand-foreground/80 mb-8">
          Every sponsored student receives an opportunity to learn the
          Qur&apos;an and Islamic knowledge through structured online
          education — regardless of their family&apos;s ability to pay.
        </p>
        <Button asChild size="lg" variant="gold">
          <Link href="/sponsor">Sponsor a Student</Link>
        </Button>
      </div>
    </section>
  );
}
