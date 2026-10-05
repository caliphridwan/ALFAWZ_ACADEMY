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
  const [settings, featuredCourses, testimonials] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    }),

    prisma.course.findMany({
      where: { active: true },
      take: 3,
      orderBy: { createdAt: "asc" },
      include: { instructor: true },
    }),

    prisma.testimonial.findMany({
      where: { published: true },
      take: 3,
    }),
  ]);

  /*
   * Some versions of the Prisma SiteSettings type may not yet include
   * heroImageUrl. This keeps the page build-safe while still allowing
   * the value to be used when it exists in the database.
   */
  const heroImageUrl =
    (settings as { heroImageUrl?: string | null } | null)?.heroImageUrl ??
    null;

  const stats = {
    studentsCount: settings?.studentsCount ?? null,
    countriesCount: settings?.countriesCount ?? null,
    classesDelivered: settings?.classesDelivered ?? null,
  };

  return (
    <>
      {/* =========================================================
          HERO
      ========================================================== */}
      <Hero imageUrl={heroImageUrl} />

      {/* =========================================================
          STATS
      ========================================================== */}
      <Reveal direction="up" amount={0.2}>
        <StatsSection stats={stats} />
      </Reveal>

      {/* =========================================================
          FEATURED COURSES
      ========================================================== */}
      <section className="container py-20">
        <Reveal direction="up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                Learn With Us
              </span>

              <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                Featured Courses
              </h2>

              <p className="text-muted-foreground mt-3 max-w-2xl">
                Explore structured Qur&apos;an and Islamic studies programmes
                designed to help you learn, understand and grow.
              </p>
            </div>

            <Link
              href="/courses"
              className="inline-flex items-center font-semibold text-primary hover:underline whitespace-nowrap"
            >
              View all courses →
            </Link>
          </div>
        </Reveal>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <StaggerItem key={course.id}>
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
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* =========================================================
          WHO WE ARE
      ========================================================== */}
      <section className="container py-20">
        <Reveal direction="left">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                Who We Are
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-6">
                An Academy for Qur&apos;an, Knowledge &amp; Character
              </h2>

              <p className="text-muted-foreground leading-7 mb-5">
                AlFawz Academy is an online Qur&apos;an and Islamic education
                institution dedicated to helping Muslims build a meaningful
                and lasting relationship with the Qur&apos;an and their Deen.
              </p>

              <p className="text-muted-foreground leading-7 mb-5">
                We provide structured Islamic education for children, youth
                and adults, combining authentic Islamic knowledge with a
                modern, accessible and engaging learning experience.
              </p>

              <p className="text-muted-foreground leading-7">
                Our goal goes beyond helping students read or memorise the
                Qur&apos;an. We want every learner to understand, practise and
                live by what they learn.
              </p>
            </div>

            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-8 sm:p-10">
              <h3 className="text-2xl font-bold mb-6">
                What We Believe
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-1">Knowledge</h4>
                  <p className="text-sm text-muted-foreground">
                    Sound and beneficial Islamic knowledge forms the foundation
                    of meaningful growth.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Understanding</h4>
                  <p className="text-sm text-muted-foreground">
                    We encourage students to understand what they learn rather
                    than simply memorising information.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Practice</h4>
                  <p className="text-sm text-muted-foreground">
                    Knowledge becomes meaningful when it is translated into
                    worship and everyday life.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Character</h4>
                  <p className="text-sm text-muted-foreground">
                    Islamic education should produce humility, good manners,
                    responsibility and beautiful character.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* =========================================================
          OUR STORY
      ========================================================== */}
      <section className="bg-muted/40 py-20">
        <div className="container">
          <Reveal direction="up">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                Our Story
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-5">
                From a Desire to Teach to a Growing Learning Community
              </h2>

              <p className="text-muted-foreground leading-7">
                AlFawz Academy was born from a simple conviction: every
                Muslim deserves access to sound Islamic education, regardless
                of where they live or how busy their lives may be.
              </p>
            </div>
          </Reveal>

          <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <StaggerItem>
              <div className="h-full rounded-xl bg-background border p-7 hover:border-primary/40 transition-colors">
                <div className="text-3xl font-bold text-primary mb-4">
                  01
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  A Need We Recognised
                </h3>

                <p className="text-sm text-muted-foreground leading-6">
                  Many Muslims sincerely desire to learn the Qur&apos;an and
                  understand their religion but struggle to find structured,
                  reliable and accessible learning opportunities.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="h-full rounded-xl bg-background border p-7 hover:border-primary/40 transition-colors">
                <div className="text-3xl font-bold text-primary mb-4">
                  02
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  A Mission We Embraced
                </h3>

                <p className="text-sm text-muted-foreground leading-6">
                  AlFawz was established to make quality Islamic education
                  more accessible through structured online learning and
                  personal guidance.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="h-full rounded-xl bg-background border p-7 hover:border-primary/40 transition-colors">
                <div className="text-3xl font-bold text-primary mb-4">
                  03
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  A Future We Are Building
                </h3>

                <p className="text-sm text-muted-foreground leading-6">
                  We continue to grow a community of learners who seek
                  beneficial knowledge and strive to apply it in their daily
                  lives.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* =========================================================
          MISSION & VISION
      ========================================================== */}
      <section className="container py-20">
        <div className="grid md:grid-cols-2 gap-6">
          <Reveal direction="left">
            <div className="h-full rounded-2xl border p-8 sm:p-10">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                Our Mission
              </span>

              <h2 className="text-3xl font-bold mt-3 mb-5">
                Making Authentic Islamic Education Accessible
              </h2>

              <p className="text-muted-foreground leading-7 mb-6">
                Our mission is to make authentic, structured and engaging
                Islamic education accessible to Muslims everywhere.
              </p>

              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  ✓ Teach the Qur&apos;an with proper recitation and Tajweed.
                </li>
                <li>✓ Provide sound foundational Islamic knowledge.</li>
                <li>
                  ✓ Develop students who combine knowledge with action.
                </li>
                <li>
                  ✓ Nurture strong Islamic character and beautiful manners.
                </li>
                <li>
                  ✓ Encourage lifelong learning and continuous growth.
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.1}>
            <div className="h-full rounded-2xl bg-primary text-primary-foreground p-8 sm:p-10">
              <span className="text-sm font-semibold uppercase tracking-wider opacity-80">
                Our Vision
              </span>

              <h2 className="text-3xl font-bold mt-3 mb-5">
                Raising a Generation Rooted in the Qur&apos;an
              </h2>

              <p className="opacity-90 leading-7 mb-6">
                Our vision is to become a trusted global Islamic education
                institution that nurtures generations of Muslims who are
                firmly connected to the Qur&apos;an, grounded in authentic
                Islamic knowledge and distinguished by excellent character.
              </p>

              <p className="opacity-90 leading-7">
                We envision a future where every Muslim has access to
                beneficial Islamic education and where knowledge produces
                upright families, strong communities and positive contributors
                to society.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          EDUCATIONAL PHILOSOPHY
      ========================================================== */}
      <section className="bg-muted/40 py-20">
        <div className="container">
          <Reveal direction="up">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                Our Educational Philosophy
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-5">
                Knowledge. Understanding. Practice. Character.
              </h2>

              <p className="text-muted-foreground leading-7">
                At AlFawz Academy, we believe that Islamic education should
                transform the learner. Education should not end when a class
                ends; it should influence how a person worships Allah, treats
                people and navigates life.
              </p>
            </div>
          </Reveal>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                number: "01",
                title: "Knowledge",
                text: "We provide sound and beneficial Islamic knowledge through structured learning.",
              },
              {
                number: "02",
                title: "Understanding",
                text: "We help students understand what they learn rather than simply memorising information.",
              },
              {
                number: "03",
                title: "Practice",
                text: "We encourage students to translate knowledge into worship, conduct and daily life.",
              },
              {
                number: "04",
                title: "Character",
                text: "We believe genuine Islamic education should produce humility, respect, responsibility and beautiful character.",
              },
            ].map((item) => (
              <StaggerItem key={item.number}>
                <div className="h-full rounded-xl bg-background border p-6 text-center hover:border-primary/40 transition-colors">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {item.number}
                  </div>

                  <h3 className="text-lg font-semibold mb-3">
                    {item.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-6">
                    {item.text}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <Reveal direction="up" delay={0.15}>
            <div className="max-w-2xl mx-auto text-center mt-12">
              <p className="text-xl sm:text-2xl font-semibold">
                &ldquo;We do not want students who simply know more. We want
                students who become better.&rdquo;
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          CORE VALUES
      ========================================================== */}
      <section className="container py-20">
        <Reveal direction="up">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Our Core Values
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-5">
              The Principles That Guide Us
            </h2>

            <p className="text-muted-foreground">
              These principles shape how we teach, how we serve our students
              and how we continue to grow as an institution.
            </p>
          </div>
        </Reveal>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="h-full rounded-xl border p-7 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-2xl font-bold text-primary">
                  {value.title}
                </h3>

                <p className="font-medium mt-1 mb-3">
                  {value.subtitle}
                </p>

                <p className="text-sm text-muted-foreground leading-6">
                  {value.text}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* =========================================================
          WHY ALFAWZ
      ========================================================== */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container">
          <Reveal direction="up">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-sm font-semibold uppercase tracking-wider opacity-80">
                Why AlFawz Academy
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-6">
                More Than Lessons. A Journey of Growth.
              </h2>

              <p className="opacity-90 leading-7">
                Our aim is not simply to complete lessons or courses. We want
                to help students develop a lasting relationship with the
                Qur&apos;an, strengthen their Islamic knowledge and grow into
                Muslims whose knowledge is reflected in their character and
                daily lives.
              </p>
            </div>
          </Reveal>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <StaggerItem>
              <div className="h-full rounded-xl bg-white/10 border border-white/10 p-6 hover:bg-white/15 transition-colors">
                <h3 className="font-semibold text-lg mb-2">
                  Structured Learning
                </h3>

                <p className="text-sm opacity-80">
                  Organised learning pathways designed to help students
                  progress with clarity and purpose.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="h-full rounded-xl bg-white/10 border border-white/10 p-6 hover:bg-white/15 transition-colors">
                <h3 className="font-semibold text-lg mb-2">
                  Personal Attention
                </h3>

                <p className="text-sm opacity-80">
                  Students receive guidance and feedback according to their
                  individual learning needs.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="h-full rounded-xl bg-white/10 border border-white/10 p-6 hover:bg-white/15 transition-colors">
                <h3 className="font-semibold text-lg mb-2">
                  Flexible Online Education
                </h3>

                <p className="text-sm opacity-80">
                  Learn from wherever you are while remaining connected to a
                  supportive learning community.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* =========================================================
          WHO WE SERVE
      ========================================================== */}
      <section className="container py-20">
        <Reveal direction="up">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Who We Serve
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-5">
              Islamic Learning for Every Stage of Life
            </h2>

            <p className="text-muted-foreground">
              Wherever you are in your Islamic learning journey, there is a
              place for you at AlFawz Academy.
            </p>
          </div>
        </Reveal>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Children",
              text: "Building strong foundations in Qur'an reading, memorisation, Islamic manners, Du'as and essential Islamic knowledge.",
            },
            {
              title: "Youth",
              text: "Helping young Muslims develop knowledge, confidence and a strong Islamic identity.",
            },
            {
              title: "Adults",
              text: "Providing opportunities to improve Qur'an recitation, memorisation and deepen Islamic knowledge at every stage of life.",
            },
            {
              title: "Families",
              text: "Supporting parents who want to create homes where the Qur'an, Islamic knowledge and good character are valued.",
            },
          ].map((item) => (
            <StaggerItem key={item.title}>
              <div className="h-full rounded-xl border p-6 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-xl font-semibold mb-3">
                  {item.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-6">
                  {item.text}
                </p>
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
        <section className="container py-20">
          <Reveal direction="up">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                Testimonials
              </span>

              <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                What Our Students Say
              </h2>

              <p className="text-muted-foreground mt-3">
                Hear from members of the AlFawz learning community.
              </p>
            </div>
          </Reveal>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <StaggerItem key={t.id}>
                <blockquote className="h-full rounded-lg border border-border p-6 bg-card hover:border-primary/30 transition-colors">
                  <p className="text-sm text-muted-foreground mb-4">
                    &ldquo;{t.content}&rdquo;
                  </p>

                  <footer className="flex items-center gap-3">
                    {t.image && (
                      <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 bg-primary/10">
                        <Image
                          src={t.image}
                          alt={t.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                    )}

                    <span className="text-sm font-medium">
                      {t.name}

                      {t.country ? (
                        <span className="text-muted-foreground font-normal">
                          , {t.country}
                        </span>
                      ) : null}
                    </span>
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
      <section className="bg-muted/40 py-20">
        <Reveal direction="up">
          <div className="container text-center">
            <h2 className="text-2xl sm:text-4xl font-bold mb-5">
              Ready to Begin Your Journey With the Qur&apos;an?
            </h2>

            <p className="max-w-2xl mx-auto text-muted-foreground mb-8 leading-7">
              Whether you are beginning your Qur&apos;an journey, seeking to
              improve your Tajweed, pursuing memorisation or looking to deepen
              your understanding of Islam, your journey can begin today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:-translate-y-0.5"
              >
                Enroll Now
              </Link>

              <Link
                href="/courses"
                className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-semibold shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5"
              >
                Explore Courses
              </Link>
            </div>

            <p className="mt-8 text-sm font-medium">
              Learn the Qur&apos;an. Understand your Deen. Transform your
              Life.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}

