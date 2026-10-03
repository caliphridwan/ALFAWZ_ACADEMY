import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Laptop,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

/* =========================================================
   HERO
========================================================= */

export function Hero({ imageUrl }: { imageUrl?: string | null }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream via-background to-background">
      <div
        className="absolute inset-0 bg-geo-pattern bg-repeat opacity-[0.04] pointer-events-none"
        aria-hidden
      />

      <div
        className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand/10 blur-3xl"
        aria-hidden
      />

      <div
        className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
        aria-hidden
      />

      <div className="container relative py-16 sm:py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* LEFT */}
          <div className="max-w-2xl">
            <span
              className="
                arabic-text mb-5 block text-center text-xl
                font-extrabold tracking-wide text-brand/80
                sm:text-left sm:text-xl lg:text-2xl
              "
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/10 bg-brand/5 px-4 py-2 text-sm font-medium text-brand">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
              Online Qur&apos;an & Islamic Education
            </div>

            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-charcoal sm:text-5xl lg:text-6xl xl:text-7xl">
              Learn the Qur&apos;an.
              <br />
              <span className="text-brand">Understand Your Deen.</span>
              <br />
              <span className="text-charcoal">Transform Your Life.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              AlFawz Academy provides structured and engaging online Qur&apos;an
              and Islamic education for children, youth and adults — helping
              students build a stronger relationship with the Qur&apos;an,
              deepen their understanding of Islam and grow in faith.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                asChild
                size="lg"
                className="h-12 px-7 text-base shadow-lg shadow-brand/10"
              >
                <Link href="/courses">
                  Explore Our Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-brand/20 px-7 text-base"
              >
                <Link href="/register">Join Us Today</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-12 px-7 text-base"
              >
                <Link href="/sponsor">Sponsor a Student</Link>
              </Button>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-1 gap-4 border-t border-border/60 pt-7 sm:grid-cols-3">
              <div>
                <p className="text-sm font-bold text-charcoal">Children</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Strong Islamic foundations
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-charcoal">Youth</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Qur&apos;an and Islamic understanding
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-charcoal">Adults</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Continue your journey of learning
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-brand/10 bg-brand/5 shadow-2xl shadow-brand/10">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Students learning Qur'an and Islamic studies with AlFawz Academy"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,hsl(var(--brand)/0.15),transparent_60%),radial-gradient(circle_at_70%_80%,hsl(var(--gold)/0.2),transparent_60%)]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 right-5">
                <div className="rounded-2xl border border-white/20 bg-black/30 p-4 text-white backdrop-blur-md">
                  <p className="text-sm font-semibold">
                    Learn wherever you are
                  </p>
                  <p className="mt-1 text-xs text-white/80">
                    Flexible online Qur&apos;an and Islamic education for
                    students around the world.
                  </p>
                </div>
              </div>
            </div>

            {/* Hadith card */}
            <div className="absolute -bottom-8 -left-5 hidden w-72 rounded-2xl border border-border/70 bg-card/95 p-5 shadow-xl backdrop-blur sm:block lg:-left-10">
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

              <p className="mt-3 text-center text-xs font-medium text-brand">
                Sahih al-Bukhari 5027
              </p>
            </div>

            {/* Online badge */}
            <div className="absolute -right-3 -top-5 hidden rounded-2xl border border-brand/10 bg-card p-4 shadow-xl sm:block lg:-right-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
                  <Laptop className="h-5 w-5 text-brand" />
                </div>

                <div>
                  <p className="text-sm font-bold text-charcoal">
                    Learn Online
                  </p>
                  <p className="text-xs text-muted-foreground">
                    From anywhere across the globe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 bg-card/40">
        <div className="container grid grid-cols-2 divide-x divide-border/60 sm:grid-cols-4">
          <FeatureStrip title="Qur'an" text="Reading & Memorisation" />
          <FeatureStrip title="Tajweed" text="Correct Pronunciation" />
          <FeatureStrip title="Islamic Studies" text="Knowledge & Understanding" />
          <FeatureStrip title="Flexible Learning" text="Learn From Anywhere" />
        </div>
      </div>

      <div className="geo-divider" />
    </section>
  );
}

function FeatureStrip({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="px-4 py-5 text-center sm:px-6">
      <p className="text-sm font-bold text-charcoal">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function HomePage() {
  return (
    <main>
      {/* =====================================================
          HERO
      ===================================================== */}

      <Hero />

      {/* =====================================================
          INTRO / WHY ALFAWZ
      ===================================================== */}

      <section className="bg-background py-20 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              Why AlFawz Academy?
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
              More Than Learning. A Journey of Faith and Growth.
            </h2>

            <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
              Islamic education should not be limited by geography, busy
              schedules or lack of access. AlFawz Academy is designed to make
              meaningful Qur&apos;an and Islamic learning accessible to students
              wherever they are.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ValueCard
              icon={<BookOpen className="h-6 w-6" />}
              title="Qur'an-Centred"
              description="Build a lasting relationship with the Qur'an through reading, recitation, memorisation and understanding."
            />

            <ValueCard
              icon={<GraduationCap className="h-6 w-6" />}
              title="Structured Learning"
              description="Progress through carefully organised programmes designed around different ages, abilities and learning goals."
            />

            <ValueCard
              icon={<Globe2 className="h-6 w-6" />}
              title="Learn Anywhere"
              description="Access online learning from home, wherever you are in Nigeria or across the wider Muslim diaspora."
            />

            <ValueCard
              icon={<HeartHandshake className="h-6 w-6" />}
              title="Community & Support"
              description="Learning becomes easier when students and families have encouragement, guidance and a supportive environment."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          QURAN VERSE
      ===================================================== */}

      <section className="relative overflow-hidden bg-brand py-20 text-white sm:py-24">
        <div
          className="absolute inset-0 bg-geo-pattern bg-repeat opacity-[0.08]"
          aria-hidden
        />

        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <Sparkles className="mx-auto h-7 w-7 text-gold" />

            <p
              dir="rtl"
              className="arabic-text mt-7 text-2xl font-bold leading-[2] sm:text-3xl"
            >
              وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
            </p>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/85 sm:text-xl">
              “And recite the Qur&apos;an with measured recitation.”
            </p>

            <p className="mt-4 text-sm font-semibold text-gold">
              Qur&apos;an 73:4
            </p>

            <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-white/70">
              At AlFawz Academy, we seek to make Qur&apos;an learning more than
              simply completing lessons — but a disciplined journey of correct
              recitation, understanding, reflection and practice.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="bg-muted/30 py-20 sm:py-24">
        <div className="container">
          <SectionHeading
            eyebrow="How It Works"
            title="Start Your Learning Journey in Four Steps"
            description="Getting started should be simple. Choose your path, enrol and begin learning with a structured programme."
          />

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <StepCard
              number="01"
              icon={<BookOpen className="h-6 w-6" />}
              title="Choose a Programme"
              description="Explore our Qur'an, Tahfeez and Islamic Studies programmes and find the one that matches your needs."
            />

            <StepCard
              number="02"
              icon={<Users className="h-6 w-6" />}
              title="Register"
              description="Create your student account and provide the information needed to begin your learning journey."
            />

            <StepCard
              number="03"
              icon={<Clock3 className="h-6 w-6" />}
              title="Choose Your Schedule"
              description="Find a suitable learning schedule based on the programme and arrangements available."
            />

            <StepCard
              number="04"
              icon={<GraduationCap className="h-6 w-6" />}
              title="Learn & Grow"
              description="Attend your lessons, practise consistently, receive guidance and progress step by step."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURED COURSES
      ===================================================== */}

      <section className="bg-background py-20 sm:py-24">
        <div className="container">
          <SectionHeading
            eyebrow="Our Programmes"
            title="Learning Paths for Every Stage"
            description="Whether you are opening the Qur'an for the first time or seeking deeper Islamic knowledge, there is a place to begin."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CourseCard
              icon={<BookOpen className="h-7 w-7" />}
              level="Beginner"
              title="Beginners' Qur'an & Islamic Studies"
              description="Build a strong foundation in Qur'an reading, basic Tajweed, worship, Islamic beliefs and everyday Muslim manners."
              href="/courses"
            />

            <CourseCard
              icon={<Sparkles className="h-7 w-7" />}
              level="Memorisation"
              title="Tahfeezul Qur'an"
              description="A structured Qur'an memorisation programme built around new memorisation, revision and consistent progress."
              href="/courses"
            />

            <CourseCard
              icon={<GraduationCap className="h-7 w-7" />}
              level="Intermediate"
              title="Intermediate Qur'an & Islamic Studies"
              description="Develop stronger Tajweed, memorisation and understanding of Aqeedah, Fiqh, Seerah and selected Hadith."
              href="/courses"
            />

            <CourseCard
              icon={<Users className="h-7 w-7" />}
              level="Children"
              title="AlFawz Young Learners"
              description="An age-appropriate programme helping children develop Qur'an reading, memorisation, Islamic manners and foundational knowledge."
              href="/courses"
            />

            <CourseCard
              icon={<BookOpen className="h-7 w-7" />}
              level="Advanced"
              title="Advanced Islamic Studies"
              description="Explore Qur'an, Tafseer, Hadith, Fiqh, Aqeedah and Islamic character through a more advanced programme of study."
              href="/courses"
            />

            <CourseCard
              icon={<Globe2 className="h-7 w-7" />}
              level="Diaspora"
              title="Diaspora Qur'an & Islamic Education"
              description="Flexible online learning pathways for Muslim families and individuals living outside their local Islamic education communities."
              href="/courses"
            />
          </div>

          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/courses">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHO WE SERVE
      ===================================================== */}

      <section className="bg-muted/30 py-20 sm:py-24">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                Who We Serve
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
                There Is a Place for You at AlFawz
              </h2>

              <p className="mt-5 text-base leading-7 text-muted-foreground">
                Our programmes are designed to meet students at different
                stages of their learning journey. Whether you are a parent
                seeking Islamic education for your child or an adult returning
                to Qur&apos;an study, you can begin from where you are.
              </p>

              <div className="mt-8 space-y-4">
                <AudienceItem
                  title="Children"
                  text="Build Qur'an reading skills, memorisation, Islamic manners and foundational knowledge."
                />

                <AudienceItem
                  title="Teenagers & Youth"
                  text="Develop stronger faith, Qur'an understanding and practical Islamic knowledge."
                />

                <AudienceItem
                  title="Adults"
                  text="Strengthen Qur'an recitation, memorisation and understanding of your Deen."
                />

                <AudienceItem
                  title="Muslim Families Abroad"
                  text="Access structured Islamic education from wherever your family lives."
                />
              </div>

              <div className="mt-9">
                <Button asChild>
                  <Link href="/courses">
                    Find Your Learning Path
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <AudienceCard
                icon={<BookOpen className="h-6 w-6" />}
                title="Qur'an"
                description="Reading, Tajweed and memorisation."
              />

              <AudienceCard
                icon={<GraduationCap className="h-6 w-6" />}
                title="Islamic Studies"
                description="Aqeedah, Fiqh, Seerah and Hadith."
              />

              <AudienceCard
                icon={<Users className="h-6 w-6" />}
                title="Family Learning"
                description="Programmes for different ages and stages."
              />

              <AudienceCard
                icon={<Globe2 className="h-6 w-6" />}
                title="Global Access"
                description="Online learning without geographical barriers."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          LEARNING EXPERIENCE
      ===================================================== */}

      <section className="bg-background py-20 sm:py-24">
        <div className="container">
          <SectionHeading
            eyebrow="The AlFawz Experience"
            title="Learning Designed Around the Student"
            description="We want students to develop not only knowledge, but also consistency, confidence and a lasting connection with the Qur'an."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ExperienceCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Structured Progress"
              description="Students follow clear learning paths rather than approaching Islamic education without direction."
            />

            <ExperienceCard
              icon={<MessageCircle className="h-6 w-6" />}
              title="Guided Learning"
              description="Students learn through instruction, practice and feedback rather than studying entirely alone."
            />

            <ExperienceCard
              icon={<Clock3 className="h-6 w-6" />}
              title="Consistent Practice"
              description="Regular learning and revision help turn lessons into lasting knowledge and skills."
            />

            <ExperienceCard
              icon={<HeartHandshake className="h-6 w-6" />}
              title="Encouraging Environment"
              description="Students should feel supported as they learn, make mistakes, improve and grow."
            />

            <ExperienceCard
              icon={<Sparkles className="h-6 w-6" />}
              title="Faith & Character"
              description="Islamic education should influence how we worship, behave and interact with others."
            />

            <ExperienceCard
              icon={<Globe2 className="h-6 w-6" />}
              title="Accessible Online"
              description="Our online model helps make Qur'an and Islamic learning accessible beyond geographical boundaries."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          TEACHERS
      ===================================================== */}

      <section className="bg-muted/30 py-20 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              Our Teachers
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
              Learn With Guidance and Care
            </h2>

            <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
              Meaningful Islamic education requires more than information.
              Students need patient guidance, correction, encouragement and a
              learning environment that helps them progress.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-brand/10 bg-card p-8 shadow-sm sm:p-10">
            <div className="grid gap-8 sm:grid-cols-3">
              <TeacherPoint
                title="Knowledge"
                description="Lessons are centred around Qur'an and Islamic learning."
              />

              <TeacherPoint
                title="Patience"
                description="Students need room to practise, ask questions and improve."
              />

              <TeacherPoint
                title="Guidance"
                description="Learning should lead students toward practical understanding."
              />
            </div>

            <div className="mt-8 border-t border-border pt-8 text-center">
              <p className="text-sm leading-6 text-muted-foreground">
                Teacher profiles, qualifications and teaching specialisations
                can be displayed here as the academy&apos;s teaching team is
                added to the platform.
              </p>

              <Button asChild variant="outline" className="mt-5">
                <Link href="/about">Learn About AlFawz Academy</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TESTIMONIAL / STUDENT STORIES
      ===================================================== */}

      <section className="bg-background py-20 sm:py-24">
        <div className="container">
          <SectionHeading
            eyebrow="Student Experience"
            title="Growing Through Knowledge"
            description="Every student's journey is different. As your academy collects verified student feedback, their stories can become part of this section."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <TestimonialCard
              quote="AlFawz Academy is creating a space where students can build a consistent relationship with the Qur'an."
              name="Student & Family Stories"
              role="Testimonials coming soon"
            />

            <TestimonialCard
              quote="A structured learning journey can help students move from simply reading the Qur'an to understanding and living its guidance."
              name="Learning Journey"
              role="Student experience"
            />

            <TestimonialCard
              quote="Your progress may begin with one lesson, one page and one step — but consistency can transform the journey."
              name="AlFawz Academy"
              role="Our learning philosophy"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          SPONSORSHIP
      ===================================================== */}

      <section className="relative overflow-hidden bg-brand py-20 text-white sm:py-24">
        <div
          className="absolute inset-0 bg-geo-pattern bg-repeat opacity-[0.08]"
          aria-hidden
        />

        <div className="container relative">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                Give the Gift of Knowledge
              </span>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Help Another Student Begin Their Qur&apos;an Journey
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                Not every student has the same access to educational
                opportunities. Through AlFawz&apos;s sponsorship programme,
                supporters can help students access Qur&apos;an and Islamic
                education.
              </p>

              <div className="mt-7 flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-brand hover:bg-white/90"
                >
                  <Link href="/sponsor">
                    Sponsor a Student
                    <HeartHandshake className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10"
                >
                  <Link href="/sponsor">Learn About Sponsorship</Link>
                </Button>
              </div>
            </div>

            <div className="hidden h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-white/10 lg:flex">
              <HeartHandshake className="h-12 w-12 text-gold" />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          EVENTS
      ===================================================== */}

      <section className="bg-muted/30 py-20 sm:py-24">
        <div className="container">
          <SectionHeading
            eyebrow="Stay Connected"
            title="Events, Learning & Community"
            description="Keep up with programmes, learning activities, announcements and opportunities to participate in the AlFawz community."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <EventCard
              title="Upcoming Classes"
              description="Explore available courses and learning opportunities."
              href="/courses"
              icon={<BookOpen className="h-6 w-6" />}
            />

            <EventCard
              title="Academy Events"
              description="Follow upcoming educational and community events."
              href="/events"
              icon={<Sparkles className="h-6 w-6" />}
            />

            <EventCard
              title="Alumni Community"
              description="Stay connected with the AlFawz community beyond your studies."
              href="/alumni"
              icon={<Users className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <section className="bg-background py-20 sm:py-24">
        <div className="container">
          <SectionHeading
            eyebrow="Frequently Asked Questions"
            title="Questions Before You Begin?"
            description="Here are some of the things prospective students and parents may want to know."
          />

          <div className="mx-auto mt-12 max-w-3xl divide-y divide-border rounded-2xl border bg-card">
            <FaqItem
              question="Who can study at AlFawz Academy?"
              answer="Our programmes are designed for children, youth and adults, with different learning paths available according to age, ability and educational goals."
            />

            <FaqItem
              question="Can I learn Qur'an online?"
              answer="Yes. AlFawz Academy is designed around online Qur'an and Islamic education, allowing students to learn from wherever they are."
            />

            <FaqItem
              question="Do I need previous Qur'an knowledge?"
              answer="Not necessarily. Beginner programmes can provide a starting point for students who are new to Qur'an reading or need to rebuild their foundations."
            />

            <FaqItem
              question="Can children study with AlFawz?"
              answer="Yes. Our children's learning pathway is designed around age-appropriate Qur'an learning, memorisation, Islamic foundations and good character."
            />

            <FaqItem
              question="Can students outside Nigeria enrol?"
              answer="Yes. AlFawz Academy is built to serve students beyond Nigeria, subject to the availability and scheduling of the relevant programme."
            />

            <FaqItem
              question="How do I get started?"
              answer="Explore the available courses, choose a programme that fits your learning goals, register and follow the enrolment instructions provided."
            />
          </div>

          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/faq">
                View More FAQs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="relative overflow-hidden border-t bg-gradient-to-br from-brand/10 via-background to-gold/10 py-20 sm:py-24">
        <div
          className="absolute inset-0 bg-geo-pattern bg-repeat opacity-[0.035]"
          aria-hidden
        />

        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <p
              dir="rtl"
              className="arabic-text text-xl font-bold text-brand sm:text-2xl"
            >
              وَقُلْ رَبِّ زِدْنِي عِلْمًا
            </p>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl lg:text-5xl">
              Your Journey of Learning Can Begin Today.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Whether your goal is to read the Qur&apos;an correctly, memorise
              it, understand your Deen or help your child grow with Islamic
              knowledge, take the next step with AlFawz Academy.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 shadow-lg shadow-brand/10"
              >
                <Link href="/register">
                  Start Your Learning Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-8"
              >
                <Link href="/courses">Explore Courses</Link>
              </Button>
            </div>

            <p className="mt-7 text-xs text-muted-foreground">
              “O my Lord, increase me in knowledge.” — Qur&apos;an 20:114
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
        {eyebrow}
      </span>

      <h2 className="mt-3 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
        {title}
      </h2>

      <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
        {description}
      </p>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold text-charcoal">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
          {icon}
        </div>

        <span className="text-3xl font-bold text-brand/10">{number}</span>
      </div>

      <h3 className="mt-6 text-lg font-bold text-charcoal">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function CourseCard({
  icon,
  level,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  level: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
          {icon}
        </div>

        <span className="rounded-full bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">
          {level}
        </span>
      </div>

      <h3 className="mt-6 text-xl font-bold text-charcoal transition-colors group-hover:text-brand">
        {title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <div className="mt-6 flex items-center text-sm font-semibold text-brand">
        Learn More
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function AudienceItem({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-brand" />

      <div>
        <h3 className="font-semibold text-charcoal">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function AudienceCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold text-charcoal">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ExperienceCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold text-charcoal">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function TeacherPoint({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
        <CheckCircle2 className="h-6 w-6" />
      </div>

      <h3 className="mt-4 font-bold text-charcoal">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
      <div className="text-3xl text-brand/30">“</div>

      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        {quote}
      </p>

      <div className="mt-6 border-t border-border pt-5">
        <p className="font-semibold text-charcoal">{name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}

function EventCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-lg"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-bold text-charcoal group-hover:text-brand">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <div className="mt-5 flex items-center text-sm font-semibold text-brand">
        Explore
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold text-charcoal">
        <span>{question}</span>

        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand transition-transform group-open:rotate-45">
          <span className="text-xl font-normal leading-none">+</span>
        </span>
      </summary>

      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
        {answer}
      </p>
    </details>
  );
}

