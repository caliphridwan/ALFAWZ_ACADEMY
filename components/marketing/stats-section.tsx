
"use client";

import { motion } from "motion/react";

import { AnimatedCounter } from "@/components/animations/animated-counter";


import {
  Users,
  Globe2,
  BookOpen,
  GraduationCap,
} from "lucide-react";

type StatsSectionProps = {
  stats: {
    students: number;
    countries: number;
    classes: number;
    courses: number;
  };
};

export function StatsSection({ stats }: StatsSectionProps) {
  const statsItems = [
    {
      number: stats.students,
      label: "Students",
      description: "Learning with AlFawz",
      icon: Users,
    },
    {
      number: stats.countries,
      label: "Countries",
      description: "Reaching learners globally",
      icon: Globe2,
    },
    {
      number: stats.classes,
      label: "Classes",
      description: "Learning opportunities",
      icon: BookOpen,
    },
    {
      number: stats.courses,
      label: "Programmes",
      description: "Paths to grow",
      icon: GraduationCap,
    },
  ];

  return (
    <section className="relative z-10 bg-background py-8 sm:py-10 lg:py-12">
      <div className="container">

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative overflow-hidden rounded-[1.75rem] border border-brand/10 bg-white shadow-xl shadow-brand/5"
        >
          {/* =================================================
              DECORATIVE BACKGROUND
          ================================================= */}

          <div
            className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand/5"
            aria-hidden
          />

          <div
            className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-gold/5"
            aria-hidden
          />

          <div
            className="pointer-events-none absolute inset-0 bg-geo-pattern bg-repeat opacity-[0.018]"
            aria-hidden
          />

          {/* =================================================
              STATS GRID
          ================================================= */}

          <div className="relative grid grid-cols-2 lg:grid-cols-4">

            {statsItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.label}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.25,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  className={[
                    "group relative px-5 py-7 text-center transition-colors duration-300 hover:bg-brand/[0.025] sm:px-8 sm:py-8",
                    index === 0
                      ? ""
                      : "border-l border-border/60",
                    index === 2
                      ? "border-t border-border/60 lg:border-t-0"
                      : "",
                    index === 3
                      ? "border-t border-border/60 lg:border-t-0"
                      : "",
                  ].join(" ")}
                >

                  {/* Icon */}

                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand transition-all duration-300 group-hover:scale-105 group-hover:bg-brand group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Number */}

                  
                  
                <p className="mt-4 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
                <AnimatedCounter value={item.number} />
                </p>




                  {/* Label */}

                  <p className="mt-1 text-sm font-bold text-brand">
                    {item.label}
                  </p>

                  {/* Description */}

                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>

                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </section>
  );
}

