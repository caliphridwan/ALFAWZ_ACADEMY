"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Globe2,
  HeartHandshake,
  Laptop,
  Sparkles,
} from "lucide-react";

type HeroProps = {
  imageUrl?: string | null;
};

/* =========================================================
   HERO
========================================================= */

export function Hero({ imageUrl }: HeroProps) {
  const reduceMotion = useReducedMotion();

  
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};



  const imageReveal = {
    hidden: {
      opacity: 0,
      x: reduceMotion ? 0 : 30,
      scale: reduceMotion ? 1 : 0.97,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: reduceMotion ? 0 : 0.9,
        delay: 0.15,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream via-background to-blue-50/50">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="pointer-events-none absolute inset-0 bg-geo-pattern bg-repeat opacity-[0.035]"
        aria-hidden
      />

      {/* Blue atmosphere */}

      <motion.div
        className="pointer-events-none absolute -right-52 -top-52 h-[620px] w-[620px] rounded-full bg-brand/10 blur-3xl"
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [1, 1.08, 1],
                opacity: [0.35, 0.55, 0.35],
              }
        }
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        aria-hidden
      />

      {/* Gold atmosphere */}

      <motion.div
        className="pointer-events-none absolute -bottom-64 -left-64 h-[600px] w-[600px] rounded-full bg-gold/10 blur-3xl"
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [1, 1.06, 1],
                opacity: [0.25, 0.4, 0.25],
              }
        }
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        aria-hidden
      />

      {/* Small decorative dots */}

      <div
        className="pointer-events-none absolute left-[7%] top-[25%] hidden h-2 w-2 rounded-full bg-brand/30 lg:block"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute left-[9%] top-[29%] hidden h-1.5 w-1.5 rounded-full bg-gold/50 lg:block"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute right-[8%] top-[35%] hidden h-2 w-2 rounded-full bg-brand/20 lg:block"
        aria-hidden
      />

      {/* =====================================================
          HERO CONTENT
      ===================================================== */}

      <div className="container relative py-14 sm:py-20 lg:py-24 xl:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.95fr] lg:gap-16 xl:gap-24">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="relative z-10 max-w-2xl">

            {/* Bismillah */}

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <span className="arabic-text mb-5 block text-center text-lg font-extrabold tracking-wide text-brand/80 sm:text-left sm:text-xl lg:text-2xl">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </span>
            </motion.div>

            {/* Eyebrow */}

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.08 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/10 bg-white/80 px-4 py-2 text-sm font-semibold text-brand shadow-sm backdrop-blur"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/30" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-brand" />
              </span>

              Online Qur&apos;an &amp; Islamic Education
            </motion.div>

            {/* Heading */}

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.18 }}
              className="text-4xl font-bold leading-[1.06] tracking-tight text-charcoal sm:text-5xl lg:text-6xl xl:text-[4.35rem]"
            >
              Learn the Qur&apos;an.
              <br />

              <span className="relative text-brand">
                Understand Your Deen.

                <span
                  className="absolute -bottom-1 left-0 h-1 w-24 rounded-full bg-gold/60"
                  aria-hidden
                />
              </span>

              <br />

              <span>Transform Your Life.</span>
            </motion.h1>

            {/* Accent */}

            <motion.div
              initial={{
                opacity: 0,
                scaleX: 0,
              }}
              animate={{
                opacity: 1,
                scaleX: 1,
              }}
              transition={{
                delay: 0.55,
                duration: reduceMotion ? 0 : 0.6,
              }}
              style={{ transformOrigin: "left" }}
              className="mt-7 h-1 w-16 rounded-full bg-brand"
            />

            {/* Description */}

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.35 }}
              className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
            >
              AlFawz Academy provides structured and engaging online
              Qur&apos;an and Islamic education for children, youth and
              adults — helping students build a stronger relationship with
              the Qur&apos;an, deepen their understanding of Islam and grow
              in faith.
            </motion.p>

            {/* CTA */}

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <Button
                asChild
                size="lg"
                className="group h-12 px-7 text-base shadow-lg shadow-brand/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href="/courses">
                  Explore Our Courses

                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-brand/20 bg-white px-7 text-base transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-brand/5"
              >
                <Link href="/register">
                  Join Us Today
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-12 px-7 text-base font-semibold text-brand transition-all duration-300 hover:bg-brand/5"
              >
                <Link href="/sponsor">
                  Sponsor a Student
                </Link>
              </Button>
            </motion.div>

            {/* Audience */}

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.65 }}
              className="mt-10 grid max-w-xl grid-cols-1 gap-4 border-t border-border/60 pt-7 sm:grid-cols-3 sm:gap-0"
            >
              <Audience
                title="Children"
                description="Strong Islamic foundations"
              />

              <Audience
                title="Youth"
                description="Qur'an & Islamic understanding"
              />

              <Audience
                title="Adults"
                description="Continue your learning journey"
              />
            </motion.div>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <motion.div
            variants={imageReveal}
            initial="hidden"
            animate="visible"
            className="relative mx-auto w-full max-w-xl lg:max-w-none"
          >

            {/* Decorative geometric frame */}

            <div className="absolute -inset-4 rounded-[2.5rem] border border-brand/10 bg-brand/[0.015]" />

            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-3xl border border-brand/10 bg-brand/5" />

            <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full border border-gold/20 bg-gold/5" />

            {/* Main image */}

            <motion.div
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: -5,
                    }
              }
              transition={{
                duration: 0.35,
              }}
              className="relative overflow-visible"
            >
              <div className="relative rounded-[2rem] bg-gradient-to-br from-brand/25 via-brand/5 to-gold/20 p-1.5 shadow-2xl shadow-brand/10">

                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.65rem] bg-brand/5">

                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Students learning Qur'an and Islamic studies with AlFawz Academy"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 hover:scale-[1.025]"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-brand/10 via-white to-gold/10" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

                  {/* Image label */}

                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
                    <div className="rounded-2xl border border-white/20 bg-black/30 p-4 text-white backdrop-blur-md">
                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                          <BookOpen className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            Learn wherever you are
                          </p>

                          <p className="mt-1 text-xs text-white/80">
                            Qur&apos;an &amp; Islamic education without
                            geographical barriers.
                          </p>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Online badge */}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.6 }}
                className="absolute -right-3 -top-5 hidden rounded-2xl border border-brand/10 bg-white p-4 shadow-xl sm:block lg:-right-7"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
                    <Laptop className="h-5 w-5 text-brand" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-charcoal">
                      Learn Online
                    </p>

                    <p className="text-xs text-muted-foreground">
                      From anywhere
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Hadith */}

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.7 }}
                className="absolute -bottom-11 -left-5 hidden w-72 rounded-2xl border border-border/70 bg-white p-5 shadow-xl sm:block lg:-left-10"
              >
                <p
                  dir="rtl"
                  className="arabic-text text-center text-lg font-extrabold leading-8 text-brand"
                >
                  خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
                </p>

                <div className="my-3 h-px bg-border" />

                <p className="text-center text-sm font-medium leading-6 text-charcoal">
                  &ldquo;The best among you are those who learn the Qur&apos;an
                  and teach it.&rdquo;
                </p>

                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Prophet Muhammad ﷺ
                </p>

                <p className="mt-3 text-center text-xs font-semibold text-brand">
                  Sahih al-Bukhari 5027
                </p>
              </motion.div>

              {/* Sponsorship pill */}

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-6 right-5 hidden rounded-full border border-gold/20 bg-white px-4 py-2 shadow-lg sm:flex sm:items-center sm:gap-2"
              >
                <HeartHandshake className="h-4 w-4 text-gold" />

                <span className="text-xs font-semibold text-charcoal">
                  Give the gift of knowledge
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* =====================================================
          FEATURE STRIP
      ===================================================== */}

      <div className="border-t border-border/50 bg-white/90 backdrop-blur">
        <div className="container grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">

          <FeatureStrip
            icon={<BookOpen className="h-4 w-4" />}
            title="Qur'an"
            text="Reading & Memorisation"
          />

          <FeatureStrip
            icon={<Sparkles className="h-4 w-4" />}
            title="Tajweed"
            text="Correct Pronunciation"
          />

          <FeatureStrip
            icon={<Globe2 className="h-4 w-4" />}
            title="Islamic Studies"
            text="Knowledge & Understanding"
          />

          <FeatureStrip
            icon={<Laptop className="h-4 w-4" />}
            title="Flexible Learning"
            text="Learn From Anywhere"
          />

        </div>
      </div>

      <div className="geo-divider" />
    </section>
  );
}

/* =========================================================
   AUDIENCE
========================================================= */

function Audience({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="sm:px-5 first:sm:pl-0 last:sm:pr-0">
      <p className="text-sm font-bold text-charcoal">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   FEATURE STRIP
========================================================= */

function FeatureStrip({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group px-4 py-5 text-center transition-colors duration-300 hover:bg-brand/[0.025] sm:px-6">

      <div className="mx-auto flex w-fit items-center gap-2 text-brand">
        {icon}

        <p className="text-sm font-bold text-charcoal group-hover:text-brand">
          {title}
        </p>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {text}
      </p>
    </div>
  );
}