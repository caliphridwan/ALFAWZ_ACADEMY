import fs from "fs";
import path from "path";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Checked at request time on the server, so the page never shows a broken
// image before the admin has added one — it just falls back to the
// decorative gradient until public/images/hero.jpg exists.
function heroImageExists() {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", "images", "hero.jpg"));
  } catch {
    return false;
  }
}

export function Hero() {
  const hasHeroImage = heroImageExists();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream to-background">
      <div
        className="absolute inset-0 bg-geo-pattern bg-repeat opacity-[0.04] pointer-events-none"
        aria-hidden
      />
      <div className="container relative py-24 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="arabic-text text-brand/70 block mb-4 font-black">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-charcoal">
            Learn the Qur&apos;an.
            <br />
            Understand Your Deen.
            <br />
            <span className="text-brand">Transform Your Life.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg">
            AlFawz Academy provides structured online Qur&apos;an and Islamic
            education for children, youth and adults, wherever they are in
            the world.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/courses">Explore Courses</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sponsor">Sponsor a Student</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/3] rounded-2xl bg-brand/5 border border-brand/10 flex items-center justify-center overflow-hidden relative">
            {hasHeroImage ? (
              <Image src="https://res.cloudinary.com/tpkzrkj7/image/upload/f_auto/q_auto/under-9.jpg" alt="Students learning with AlFawz Academy" fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(circle_at_30%_20%,hsl(var(--brand)/0.15),transparent_60%),radial-gradient(circle_at_70%_80%,hsl(var(--gold)/0.2),transparent_60%)]" />
            )}
          </div>
          <div className="absolute -bottom-6 -left-6 hidden sm:block rounded-xl bg-card border border-border shadow-lg p-4">
            <p className="text-md font-black">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ </p>
            <p className="text-sm font-medium">The best among you are those who </p>
            <p className="text-sm font-medium">learn the Qur'an and teach it.</p>
            <p className="text-sm font-medium">Live online classes</p>
            <p className="text-xs text-muted-foreground">Qualified teachers, worldwide</p>
          </div>
        </div>
      </div>
      <div className="geo-divider" />
    </section>
  );
}
