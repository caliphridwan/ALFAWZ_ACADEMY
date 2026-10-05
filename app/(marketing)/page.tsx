import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/db/prisma";

import { Hero } from "@/components/marketing/hero";
import { StatsSection } from "@/components/marketing/stats-section";
import { CourseCard } from "@/components/courses/course-card";
import { SponsorshipCta } from "@/components/marketing/sponsorship-cta";

import { Reveal } from "@/components/animations/reveal";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/stagger";

export default async function HomePage() {
  const [
    settings,
    featuredCourses,
    testimonials,
    coursesCount,
  ] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    }),

    prisma.course.findMany({
      where: { active: true },
      take: 3,
      orderBy: { createdAt: "asc" },
      include: {
        instructor: true,
      },
    }),

    prisma.testimonial.findMany({
      where: { published: true },
      take: 3,
    }),

    prisma.course.count({
      where: { active: true },
    }),
  ]);

  /*
   * Some older Prisma schemas may not have heroImageUrl
   * in the generated SiteSettings type yet.
   */
  const heroImageUrl =
    (settings as { heroImageUrl?: string | null } | null)
      ?.heroImageUrl ?? null;

  /*
   * Homepage statistics
   *
   * These values come from SiteSettings, while the number
   * of active courses comes directly from the Course table.
   */
  const stats = {
    students: settings?.studentsCount ?? 0,
    countries: settings?.countriesCount ?? 0,
    classes: settings?.classesDelivered ?? 0,
    courses: coursesCount,
  };

  return (
    <main className="overflow-hidden">

      {/* =========================================================
          HERO
      ========================================================== */}

      <Hero imageUrl={heroImageUrl} />

      {/* =========================================================
          TRUST / STATS
          
          IMPORTANT:
          This is intentionally NOT wrapped in another section,
          negative margin, absolute container, or card.
          StatsSection controls its own layout.
      ========================================================== */}

      <StatsSection stats={stats} />

      {/* =========================================================
          FEATURED COURSES
      ========================================================== */}

      <section className="container py-16 sm:py-24 lg:py-28">
        <Reveal>
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                <span className="h-px w-8 bg-primary" />
                Learn With Us
              </span>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Knowledge that shapes the heart.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
                Explore carefully structured Qur&apos;an and Islamic studies
                programmes designed to help learners gain knowledge,
                understanding and confidence.
              </p>
            </div>

            <Link
              href="/courses"
              className="group inline-flex items-center gap-2 font-semibold text-primary"
            >
              Explore all courses
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </Reveal>

        <StaggerContainer className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.map((course) => (
            <StaggerItem key={course.id}>
              <div className="group h-full">
                <CourseCard
                  course={{
                    slug: course.slug,
                    title: course.title,
                    shortDescription: course.shortDescription,
                    image: course.image,
                    level: course.level,
                    duration: course.duration,
                    price: Number(course.price),
                    currency: course.currency,
                    ageGroup: course.ageGroup,
                    instructorName: course.instructor?.name,
                    enrollmentOpen: course.enrollmentOpen,
                  }}
                />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* =========================================================
          WHO WE ARE
      ========================================================== */}

      <section className="relative bg-muted/40 py-24 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          aria-hidden
        >
          <div className="absolute -right-32 top-20 h-96 w-96 rounded-full border-[40px] border-primary" />
          <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full border-[30px] border-primary" />
        </div>

        <div className="container relative">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">

            <Reveal direction="left">
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  <span className="h-px w-8 bg-primary" />
                  Who We Are
                </span>

                <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  An academy where knowledge becomes a way of life.
                </h2>

                <div className="mt-7 space-y-5 leading-7 text-muted-foreground">
                  <p>
                    AlFawz Academy is an online Qur&apos;an and Islamic
                    education institution dedicated to helping Muslims build a
                    meaningful and lasting relationship with the Qur&apos;an
                    and their Deen.
                  </p>

                  <p>
                    We provide structured Islamic education for children,
                    youth and adults, combining authentic Islamic knowledge
                    with a modern, accessible and engaging learning experience.
                  </p>

                  <p>
                    Our goal goes beyond helping students read or memorise the
                    Qur&apos;an. We want every learner to understand, practise
                    and live by what they learn.
                  </p>
                </div>

                <Link
                  href="/about"
                  className="group mt-8 inline-flex items-center gap-2 font-semibold text-primary"
                >
                  Discover AlFawz Academy
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.1}>
              <div className="relative">
                <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/5" />

                <div className="rounded-[1.5rem] border bg-background p-7 shadow-lg shadow-primary/5 sm:p-9">
                  <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
                      ✦
                    </div>

                    <div>
                      <p className="text-lg font-bold">
                        What We Believe
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Four foundations of our approach
                      </p>
                    </div>
                  </div>

                  <div className="space-y-7">
                    {[
                      {
                        number: "01",
                        title: "Knowledge",
                        text: "Sound and beneficial Islamic knowledge forms the foundation of meaningful growth.",
                      },
                      {
                        number: "02",
                        title: "Understanding",
                        text: "We help students understand what they learn rather than simply memorising information.",
                      },
                      {
                        number: "03",
                        title: "Practice",
                        text: "Knowledge becomes meaningful when it is translated into worship and everyday life.",
                      },
                      {
                        number: "04",
                        title: "Character",
                        text: "Islamic education should produce humility, responsibility and beautiful character.",
                      },
                    ].map((item) => (
                      <div
                        key={item.number}
                        className="flex gap-4"
                      >
                        <span className="pt-1 text-xs font-bold text-primary">
                          {item.number}
                        </span>

                        <div>
                          <h3 className="mb-1 font-semibold">
                            {item.title}
                          </h3>

                          <p className="text-sm leading-6 text-muted-foreground">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* =========================================================
          HOW WE TEACH
      ========================================================== */}

      <section className="container py-24 sm:py-28">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-px w-8 bg-primary" />
              Our Approach
              <span className="h-px w-8 bg-primary" />
            </span>

            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Learn. Understand. Practise. Become.
            </h2>

            <p className="mt-5 leading-7 text-muted-foreground">
              We believe Islamic education should do more than fill the mind.
              It should shape the heart, strengthen worship and influence
              everyday life.
            </p>
          </div>
        </Reveal>

        <StaggerContainer className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              number: "01",
              title: "Learn",
              text: "Gain sound knowledge through structured lessons and authentic Islamic sources.",
            },
            {
              number: "02",
              title: "Understand",
              text: "Go beyond memorisation by developing a deeper understanding of what you learn.",
            },
            {
              number: "03",
              title: "Practise",
              text: "Turn knowledge into worship, conduct and meaningful everyday action.",
            },
            {
              number: "04",
              title: "Become",
              text: "Grow into a Muslim whose knowledge is reflected in character and daily life.",
            },
          ].map((item) => (
            <StaggerItem key={item.number}>
              <div className="group relative h-full rounded-2xl border bg-background p-7 transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                <span className="text-5xl font-bold text-primary/10 transition-colors group-hover:text-primary/20">
                  {item.number}
                </span>

                <h3 className="mt-5 mb-3 text-xl font-bold">
                  {item.title}
                </h3>

                <p className="text-sm leading-6 text-muted-foreground">
                  {item.text}
                </p>

                <div className="mt-6 h-1 w-8 rounded-full bg-primary transition-all duration-300 group-hover:w-16" />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* =========================================================
          MISSION / VISION
      ========================================================== */}

      <section className="bg-primary py-24 text-primary-foreground sm:py-28">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-2">

            <Reveal direction="left">
              <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm sm:p-10">
                <span className="text-sm font-semibold uppercase tracking-[0.18em] opacity-70">
                  Our Mission
                </span>

                <h2 className="mt-4 mb-6 text-3xl font-bold sm:text-4xl">
                  Making authentic Islamic education accessible.
                </h2>

                <p className="mb-8 leading-7 opacity-85">
                  Our mission is to make authentic, structured and engaging
                  Islamic education accessible to Muslims everywhere.
                </p>

                <div className="space-y-4">
                  {[
                    "Teach the Qur'an with proper recitation and Tajweed.",
                    "Provide sound foundational Islamic knowledge.",
                    "Develop students who combine knowledge with action.",
                    "Nurture strong Islamic character and beautiful manners.",
                    "Encourage lifelong learning and continuous growth.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs">
                        ✓
                      </span>

                      <span className="text-sm leading-6 opacity-90">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.1}>
              <div className="h-full rounded-3xl bg-background p-8 text-foreground shadow-2xl sm:p-10">
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Our Vision
                </span>

                <h2 className="mt-4 mb-6 text-3xl font-bold sm:text-4xl">
                  Raising a generation rooted in the Qur&apos;an.
                </h2>

                <p className="mb-6 leading-7 text-muted-foreground">
                  Our vision is to become a trusted global Islamic education
                  institution that nurtures generations of Muslims who are
                  firmly connected to the Qur&apos;an, grounded in authentic
                  Islamic knowledge and distinguished by excellent character.
                </p>

                <p className="leading-7 text-muted-foreground">
                  We envision a future where every Muslim has access to
                  beneficial Islamic education and where knowledge produces
                  upright families, strong communities and positive
                  contributors to society.
                </p>

                <div className="mt-8 border-t pt-7">
                  <p className="text-lg font-semibold">
                    “Knowledge should illuminate the path, not simply fill the
                    mind.”
                  </p>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* =========================================================
          OUR STORY / TIMELINE
      ========================================================== */}

      <section className="container py-24 sm:py-28">
        <Reveal>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-px w-8 bg-primary" />
              Our Story
            </span>

            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              A vision becoming a growing community.
            </h2>

            <p className="mt-5 leading-7 text-muted-foreground">
              AlFawz Academy was born from a simple conviction: every Muslim
              deserves access to sound Islamic education.
            </p>
          </div>
        </Reveal>

        <div className="relative mx-auto max-w-4xl">
          <div className="absolute bottom-0 left-4 top-0 w-px bg-border sm:left-1/2 sm:-translate-x-1/2" />

          <div className="space-y-12">
            {[
              {
                number: "01",
                title: "A Need We Recognised",
                text: "Many Muslims sincerely desire to learn the Qur'an and understand their religion but struggle to find structured, reliable and accessible learning opportunities.",
              },
              {
                number: "02",
                title: "A Mission We Embraced",
                text: "AlFawz was established to make quality Islamic education more accessible through structured online learning and personal guidance.",
              },
              {
                number: "03",
                title: "A Future We Are Building",
                text: "We continue to grow a community of learners who seek beneficial knowledge and strive to apply it in their daily lives.",
              },
            ].map((item, index) => (
              <Reveal
                key={item.number}
                direction={index % 2 === 0 ? "left" : "right"}
                delay={index * 0.08}
              >
                <div
                  className={`relative grid items-center gap-8 sm:grid-cols-2 ${
                    index % 2 === 0
                      ? ""
                      : "sm:[&>div:first-child]:order-2"
                  }`}
                >
                  <div
                    className={`pl-12 sm:pl-0 ${
                      index % 2 === 0
                        ? "sm:pr-12 sm:text-right"
                        : "sm:pl-12"
                    }`}
                  >
                    <span className="text-sm font-bold text-primary">
                      {item.number}
                    </span>

                    <h3 className="mt-2 mb-3 text-2xl font-bold">
                      {item.title}
                    </h3>

                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.text}
                    </p>
                  </div>

                  <div
                    className={`absolute left-0 h-9 w-9 rounded-full border-4 border-background bg-primary shadow-lg shadow-primary/20 sm:left-1/2 sm:-translate-x-1/2 ${
                      index % 2 === 0 ? "sm:order-2" : ""
                    }`}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          CORE VALUES
      ========================================================== */}

      <section className="bg-muted/40 py-24 sm:py-28">
        <div className="container">
          <Reveal>
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Our Core Values
              </span>

              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Principles that guide everything we do.
              </h2>
            </div>
          </Reveal>

          <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Ikhlas",
                subtitle: "Sincerity",
                text: "We seek to make Allah's pleasure the foundation of our teaching, learning and service.",
              },
              {
                title: "Ihsan",
                subtitle: "Excellence",
                text: "We strive for excellence in teaching, curriculum, communication and service.",
              },
              {
                title: "Adab",
                subtitle: "Character & Manners",
                text: "We believe knowledge should produce humility, respect and beautiful conduct.",
              },
              {
                title: "Amanah",
                subtitle: "Trust",
                text: "We recognise Islamic education as a responsibility and treat that trust with seriousness.",
              },
              {
                title: "Sabr",
                subtitle: "Patience",
                text: "Every learner is different, and we give students the patience and encouragement they need.",
              },
              {
                title: "Rahmah",
                subtitle: "Compassion",
                text: "We seek to create a learning environment where every student feels respected and supported.",
              },
            ].map((value) => (
              <StaggerItem key={value.title}>
                <div className="group h-full rounded-2xl border bg-background p-7 transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-3xl font-bold text-primary">
                        {value.title}
                      </h3>

                      <p className="mt-1 font-medium">
                        {value.subtitle}
                      </p>
                    </div>

                    <span className="text-4xl font-bold text-primary/10 transition-colors group-hover:text-primary/20">
                      ✦
                    </span>
                  </div>

                  <p className="mt-6 text-sm leading-6 text-muted-foreground">
                    {value.text}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* =========================================================
          WHO WE SERVE
      ========================================================== */}

      <section className="container py-24 sm:py-28">
        <Reveal>
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Who We Serve
            </span>

            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Islamic learning for every stage of life.
            </h2>

            <p className="mt-5 leading-7 text-muted-foreground">
              Wherever you are in your Islamic learning journey, there is a
              place for you at AlFawz Academy.
            </p>
          </div>
        </Reveal>

        <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Children",
              number: "01",
              text: "Building strong foundations in Qur'an reading, memorisation, Islamic manners, Du'as and essential Islamic knowledge.",
            },
            {
              title: "Youth",
              number: "02",
              text: "Helping young Muslims develop knowledge, confidence and a strong Islamic identity.",
            },
            {
              title: "Adults",
              number: "03",
              text: "Providing opportunities to improve Qur'an recitation, memorisation and deepen Islamic knowledge at every stage of life.",
            },
            {
              title: "Families",
              number: "04",
              text: "Supporting parents who want to create homes where the Qur'an, Islamic knowledge and good character are valued.",
            },
          ].map((item) => (
            <StaggerItem key={item.title}>
              <div className="group h-full rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                <span className="text-sm font-bold text-primary">
                  {item.number}
                </span>

                <h3 className="mt-5 mb-4 text-2xl font-bold">
                  {item.title}
                </h3>

                <p className="text-sm leading-6 text-muted-foreground">
                  {item.text}
                </p>

                <div className="mt-7 flex translate-y-2 items-center gap-2 text-sm font-semibold text-primary opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  Learn more
                  <span>→</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* =========================================================
          SPONSORSHIP
      ========================================================== */}

      <Reveal direction="up">
        <SponsorshipCta />
      </Reveal>

      {/* =========================================================
          TESTIMONIALS
      ========================================================== */}

      {testimonials.length > 0 && (
        <section className="container py-24 sm:py-28">
          <Reveal>
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Testimonials
              </span>

              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Trusted by our learning community.
              </h2>

              <p className="mt-5 text-muted-foreground">
                Hear from members of the AlFawz community.
              </p>
            </div>
          </Reveal>

          <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <StaggerItem key={t.id}>
                <blockquote className="relative h-full rounded-2xl border bg-card p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 sm:p-8">
                  <div className="font-serif text-5xl leading-none text-primary/15">
                    “
                  </div>

                  <p className="-mt-2 text-sm leading-7 text-muted-foreground">
                    {t.content}
                  </p>

                  <footer className="mt-8 flex items-center gap-3 border-t pt-6">
                    {t.image ? (
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-primary/10">
                        <Image
                          src={t.image}
                          alt={t.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-semibold">
                        {t.name}
                      </p>

                      {t.country && (
                        <p className="text-xs text-muted-foreground">
                          {t.country}
                        </p>
                      )}
                    </div>
                  </footer>
                </blockquote>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      {/* =========================================================
          FINAL CTA
      ========================================================== */}

      <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground sm:py-28">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full border-[50px] border-white/5" />
          <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full border-[40px] border-white/5" />
        </div>

        <Reveal direction="up">
          <div className="container relative text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] opacity-70">
              Begin Your Journey
            </span>

            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold sm:text-4xl lg:text-5xl">
              Your journey with the Qur&apos;an can begin today.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl leading-7 opacity-85">
              Whether you are beginning your Qur&apos;an journey, seeking to
              improve your Tajweed, pursuing memorisation or looking to deepen
              your understanding of Islam, AlFawz Academy is here to help.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-background px-8 text-sm font-bold text-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Enroll Now
                <span className="ml-2">→</span>
              </Link>

              <Link
                href="/courses"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-8 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
              >
                Explore Courses
              </Link>
            </div>

            <p className="mt-10 text-sm font-medium opacity-70">
              Learn the Qur&apos;an. Understand your Deen. Transform your
              Life.
            </p>
          </div>
        </Reveal>
      </section>

    </main>
  );
}

