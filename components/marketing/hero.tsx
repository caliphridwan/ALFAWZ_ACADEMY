
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HeartHandshake,
  Play,
  Sparkles,
} from "lucide-react";

type HeroProps = {
  imageUrl?: string | null;
};

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const imageReveal: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.97,
    y: 18,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const identityReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      delay: 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function Hero({ imageUrl }: HeroProps) {
  const reduceMotion = useReducedMotion();

  const heroImage =
    imageUrl && imageUrl.trim().length > 0
      ? imageUrl
      : "/images/hero.jpg";

  return (
    <section className="relative overflow-hidden bg-background">
      {/* =====================================================
          SUBTLE ATMOSPHERE
      ====================================================== */}

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025] bg-geo-pattern"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -left-48 top-20 h-[30rem] w-[30rem] rounded-full bg-brand/10 blur-[130px]"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-48 top-32 h-[32rem] w-[32rem] rounded-full bg-brand/10 blur-[140px]"
        aria-hidden="true"
      />

      {/* =====================================================
          MAIN HERO
      ====================================================== */}

      <div className="container relative z-10">
        <div className="grid items-center gap-14 py-14 sm:py-20 lg:min-h-[700px] lg:grid-cols-[0.96fr_1.04fr] lg:gap-16 lg:py-20 xl:gap-24">
          {/* =================================================
              LEFT CONTENT
          ================================================== */}

          <div className="max-w-2xl">
            {/* Bismillah */}

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{
                delay: reduceMotion ? 0 : 0.02,
              }}
              className="mb-4"
            >
              <p
                dir="rtl"
                className="arabic-text text-center text-xl font-semibold tracking-wide text-brand/80 sm:text-left sm:text-2xl"
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </motion.div>

            {/* =================================================
                PREMIUM IDENTITY PANEL
            ================================================== */}


<motion.div
  variants={identityReveal}
  initial="hidden"
  animate="visible"
  className="mb-8 inline-flex max-w-full items-center gap-3 rounded-2xl border border-brand/10 bg-white/80 px-4 py-3 shadow-sm shadow-brand/5 backdrop-blur-md sm:px-5"
>
  {/* Animated glow behind the badge */}
  <motion.div
    className="absolute -inset-1 -z-10 rounded-2xl bg-brand/10 blur-md"
    animate={
      reduceMotion
        ? { opacity: 0.4 }
        : {
            opacity: [0.2, 0.55, 0.2],
            scale: [0.98, 1.02, 0.98],
          }
    }
    transition={{
      duration: 2.8,
      repeat: reduceMotion ? 0 : Infinity,
      ease: "easeInOut",
    }}
    aria-hidden="true"
  />

  {/* Animated icon */}
  <motion.div
    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10"
    animate={
      reduceMotion
        ? { opacity: 1 }
        : {
            scale: [1, 1.08, 1],
            rotate: [0, 4, -4, 0],
          }
    }
    transition={{
      duration: 2.4,
      repeat: reduceMotion ? 0 : Infinity,
      ease: "easeInOut",
    }}
  >
    <motion.div
      animate={
        reduceMotion
          ? { opacity: 1 }
          : {
              opacity: [0.55, 1, 0.55],
              scale: [0.9, 1.08, 0.9],
            }
      }
      transition={{
        duration: 1.8,
        repeat: reduceMotion ? 0 : Infinity,
        ease: "easeInOut",
      }}
    >
      <Sparkles
        className="h-4 w-4 text-brand"
        aria-hidden="true"
      />
    </motion.div>
  </motion.div>

  <div>
    <motion.p
      className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand"
      animate={
        reduceMotion
          ? { opacity: 1 }
          : {
              opacity: [1, 0.7, 1],
            }
      }
      transition={{
        duration: 2.2,
        repeat: reduceMotion ? 0 : Infinity,
        ease: "easeInOut",
      }}
    >
      AlFawz Academy
    </motion.p>

    <p className="mt-0.5 text-xs font-medium text-muted-foreground sm:text-sm">
      Online Qur&apos;an & Islamic Education
    </p>
  </div>
</motion.div>

            {/* =================================================
                HEADLINE
            ================================================== */}

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{
                delay: reduceMotion ? 0 : 0.2,
              }}
              className="text-[3.05rem] font-bold leading-[0.98] tracking-[-0.055em] text-charcoal sm:text-6xl md:text-7xl lg:text-[4.35rem] xl:text-[4.85rem]"
            >
              Learn the Qur&apos;an.
              <br />
              <span className="text-brand">Understand Your Deen.</span>
              <br />
              <span>Transform Your Life.</span>
            </motion.h1>

            {/* =================================================
                DESCRIPTION
            ================================================== */}

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{
                delay: reduceMotion ? 0 : 0.28,
              }}
              className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
            >
              Structured and engaging online Qur&apos;an and Islamic education
              for children, youth and adults — helping you build a stronger
              relationship with the Qur&apos;an, deepen your understanding of
              Islam and grow in faith.
            </motion.p>

            {/* =================================================
                PRIMARY ACTION
            ================================================== */}

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{
                delay: reduceMotion ? 0 : 0.36,
              }}
              className="mt-9"
            >
              <Link
                href="/courses"
                className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-brand px-7 text-sm font-bold text-white shadow-xl shadow-brand/20 transition-all duration-300 hover:-translate-y-1 hover:bg-brand/90 hover:shadow-2xl hover:shadow-brand/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:w-auto"
              >
                Explore Our Courses
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>

            {/* =================================================
                SECONDARY ACTION + SPONSOR
            ================================================== */}

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{
                delay: reduceMotion ? 0 : 0.43,
              }}
              className="mt-4 flex flex-col items-start gap-3"
            >
              <Link
                href="/register"
                className="group inline-flex h-12 items-center gap-3 rounded-xl px-1 text-sm font-bold text-charcoal transition-colors duration-300 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white transition-all duration-300 group-hover:border-brand/30 group-hover:bg-brand/5">
                  <Play
                    className="ml-0.5 h-3.5 w-3.5 fill-current"
                    aria-hidden="true"
                  />
                </span>

                Join Us Today
              </Link>

              <Link
                href="/sponsorship"
                className="group inline-flex items-center gap-2 rounded-lg px-1 text-sm font-semibold text-brand transition-all duration-300 hover:gap-3 hover:text-brand/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <HeartHandshake
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Sponsor a Student

                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>

            {/* =================================================
                TRUST INDICATORS
            ================================================== */}

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{
                delay: reduceMotion ? 0 : 0.5,
              }}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-3"
            >
              <TrustPoint text="Qualified instructors" />
              <TrustPoint text="Flexible learning" />
              <TrustPoint text="Authentic knowledge" />
            </motion.div>
          </div>

          {/* =================================================
              RIGHT SIDE IMAGE
          ================================================== */}

          <motion.div
            variants={imageReveal}
            initial="hidden"
            animate="visible"
            className="relative mx-auto w-full max-w-[620px] lg:ml-auto"
          >
            {/* Main image */}

            <div className="relative">
              <div className="relative aspect-[1/0.92] overflow-hidden rounded-[2.5rem] bg-muted shadow-2xl shadow-black/10 sm:aspect-[1/0.88] lg:aspect-[1/0.86]">
                <Image
                  src={heroImage}
                  alt="Students learning Qur'an and Islamic studies with AlFawz Academy"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="object-cover"
                />

                {/* Soft cinematic overlay */}

                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
                  aria-hidden="true"
                />

                <div
                  className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent"
                  aria-hidden="true"
                />
              </div>

              {/* =================================================
                  IMAGE FLOATING CARD
              ================================================== */}

              <motion.div
                variants={cardReveal}
                initial="hidden"
                animate="visible"
                className="absolute -bottom-5 left-4 right-4 sm:left-7 sm:right-auto sm:w-[330px]"
              >
                <div className="rounded-2xl border border-white/60 bg-white/95 p-4 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                      <BookOpen
                        className="h-5 w-5 text-brand"
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-charcoal">
                        Knowledge that transforms
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Qur&apos;an • Sunnah • Character
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Small image status */}

              <motion.div
                variants={cardReveal}
                initial="hidden"
                animate="visible"
                transition={{
                  delay: reduceMotion ? 0 : 0.5,
                }}
                className="absolute right-4 top-4 sm:right-6 sm:top-6"
              >
                <div className="flex items-center gap-2 rounded-full border border-white/30 bg-black/30 px-3 py-2 text-white backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-semibold sm:text-[11px]">
                    Learn • Grow • Transform
                  </span>
                </div>
              </motion.div>
            </div>

            {/* =================================================
                HADITH CARD
            ================================================== */}

            <motion.div
              variants={cardReveal}
              initial="hidden"
              animate="visible"
              transition={{
                delay: reduceMotion ? 0 : 0.65,
              }}
              className="mt-10 rounded-2xl border border-border/70 bg-white/80 p-5 shadow-lg shadow-black/[0.04] backdrop-blur-md sm:p-6"
            >
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
                  <BookOpen
                    className="h-4 w-4 text-brand"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold leading-6 text-charcoal">
                    “The best of you are those who learn the Qur&apos;an and
                    teach it.”
                  </p>

                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    Prophet Muhammad ﷺ · Sahih al-Bukhari 5027
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* =====================================================
            BOTTOM VALUE STRIP
        ====================================================== */}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.2,
            margin: "0px 0px -60px 0px",
          }}
          className="border-t border-border/60 py-8 sm:py-10"
        >
          <div className="grid gap-7 sm:grid-cols-3 sm:gap-0">
            <HeroPrinciple
              number="01"
              title="Learn"
              description="Build a strong foundation in Qur'anic and Islamic knowledge."
            />

            <HeroPrinciple
              number="02"
              title="Understand"
              description="Study with clarity, context, and authentic sources."
            />

            <HeroPrinciple
              number="03"
              title="Live"
              description="Turn knowledge into character, worship, and action."
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   TRUST POINT
============================================================ */

function TrustPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
      <CheckCircle2
        className="h-4 w-4 shrink-0 text-brand"
        aria-hidden="true"
      />

      <span>{text}</span>
    </div>
  );
}

/* ============================================================
   HERO PRINCIPLE
============================================================ */

function HeroPrinciple({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 sm:px-8 first:sm:pl-0 last:sm:pr-0">
      <span className="pt-0.5 text-xs font-bold tracking-[0.15em] text-brand/60">
        {number}
      </span>

      <div>
        <h3 className="text-sm font-bold text-charcoal">{title}</h3>

        <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

