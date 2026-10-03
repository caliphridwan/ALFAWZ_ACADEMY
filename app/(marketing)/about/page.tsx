import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | AlFawz Academy",
  description:
    "Learn about AlFawz Academy, our mission, vision, educational philosophy, values, and commitment to accessible Qur'an and Islamic education.",
};

// Replace this URL with your actual Cloudinary image URL
const ABOUT_IMAGE =
  "https://res.cloudinary.com/tpkzrkj7/image/upload/f_auto/q_auto/about.jpg";

const SECTIONS = [
  {
    title: "Our Story",
    body: "AlFawz Academy was established in 2023 with a simple but important purpose: to help Muslims access quality Islamic education regardless of their location, schedule, or access to local learning opportunities. By combining traditional Islamic learning with modern online education, the Academy seeks to create a learning experience that is structured, accessible, and meaningful for students of different ages and backgrounds.",
  },
  {
    title: "Our Mission",
    body: "To make authentic Islamic education accessible to Muslims everywhere through structured, well-detailed, and engaging online classes. We are committed to helping students develop a strong relationship with the Qur'an, gain sound Islamic knowledge, and apply what they learn in their daily lives.",
  },
  {
    title: "Our Vision",
    body: "To become a trusted global platform for accessible Qur'an and Islamic education, where geographical location, busy schedules, or limited local opportunities do not prevent anyone from learning the Qur'an and understanding their Deen.",
  },
  {
    title: "Our Educational Philosophy",
    body: "We believe Islamic education should be clear, structured, practical, and accessible. Learning is organized across appropriate levels — from foundational Qur'an recitation and memorization to more advanced studies in Qur'an, Hadith, Fiqh and Tafseer — allowing students to develop their knowledge progressively and at a pace suited to their needs.",
  },
  {
    title: "Our Approach to Learning",
    body: "At AlFawz Academy, we recognize that every student is different. Our approach therefore emphasizes structured lessons, clear explanations, regular practice, interaction between students and teachers, and continuous improvement. We aim to create an environment where students can ask questions, strengthen their understanding, and develop confidence in their Islamic knowledge.",
  },
  {
    title: "Qur'an-Centred Education",
    body: "The Qur'an is at the heart of our educational mission. We seek to help students improve their recitation, memorization, understanding, and relationship with the Book of Allah. Alongside Qur'anic studies, students are introduced to relevant Islamic sciences that help them understand and apply the guidance of the Qur'an and Sunnah.",
  },
  {
    title: "Who We Serve",
    body: "AlFawz Academy serves Muslims from different backgrounds, age groups, and levels of Islamic knowledge. Whether you are beginning your Qur'an journey, seeking to improve your recitation, memorise more of the Qur'an, or deepen your understanding of Islamic sciences, our programmes are designed to support you throughout your learning journey.",
  },
  {
    title: "Global Reach",
    body: "AlFawz Academy serves students across Nigeria and the wider diaspora, wherever they are in the world. Through online learning, students can access Islamic education without being limited by geographical location.",
  },
];

const CORE_VALUES = [
  {
    title: "Qur'an & Sunnah",
    body: "We place the Qur'an and authentic Sunnah at the centre of our learning and teaching.",
  },
  {
    title: "Excellence",
    body: "We strive to maintain high standards in teaching, learning, communication, and student support.",
  },
  {
    title: "Sincerity",
    body: "We encourage learning and teaching with sincerity, seeking beneficial knowledge and the pleasure of Allah.",
  },
  {
    title: "Patience",
    body: "We recognize that learning takes time and encourage students to remain consistent and patient throughout their journey.",
  },
  {
    title: "Integrity",
    body: "We value honesty, responsibility, trustworthiness, and professionalism in our educational community.",
  },
  {
    title: "Compassion",
    body: "We seek to create a welcoming environment where students are treated with respect, understanding, and care.",
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        <div className="container max-w-6xl py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-blue-200">
              About AlFawz Academy
            </span>

            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Nurturing Hearts.
              <br />
              Building Knowledge.
              <br />
              Transforming Lives.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-blue-100 sm:text-xl">
              An online Islamic education platform committed to making
              authentic Qur&apos;an and Islamic learning accessible to Muslims
              everywhere.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-500" />
      </section>

      {/* Who We Are + Image */}
      <section className="container max-w-6xl py-16 sm:py-20">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          {/* Academy Image */}
          <div className="relative overflow-hidden rounded-3xl shadow-xl">
            <Image
              src={ABOUT_IMAGE}
              alt="Students learning Qur'an through Islamic education"
              width={1200}
              height={800}
              priority
              className="h-[360px] w-full object-cover sm:h-[440px]"
            />

            {/* Image Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-blue-950/90 via-blue-950/30 to-transparent p-6 pt-20">
              <p className="text-lg font-semibold text-white">
                Knowledge. Faith. Growth.
              </p>
              <p className="mt-1 text-sm text-blue-100">
                Empowering Muslims through accessible Islamic education.
              </p>
            </div>
          </div>

          {/* Who We Are */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Who We Are
            </span>

            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Building a Stronger Ummah Through Knowledge
            </h2>

            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              AlFawz Academy is an online Islamic education institution
              dedicated to making authentic Qur&apos;an and Islamic learning
              accessible to students wherever they are.
            </p>

            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Through structured online classes, dedicated teachers, and a
              student-centred learning environment, we seek to help Muslims
              strengthen their relationship with the Qur&apos;an, understand
              their Deen, and apply beneficial knowledge in their daily lives.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl border bg-background p-4">
                <p className="text-2xl font-bold text-blue-700">Qur&apos;an</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  At the heart of our learning
                </p>
              </div>

              <div className="rounded-xl border bg-background p-4">
                <p className="text-2xl font-bold text-blue-700">Online</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Learn from anywhere
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Sections */}
      <section className="bg-muted/40">
        <div className="container max-w-5xl py-16 sm:py-20">
          <div className="space-y-12">
            {SECTIONS.map((section, index) => (
              <section
                key={section.title}
                className="relative border-l-2 border-blue-200 pl-6 sm:pl-8"
              >
                <span className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h2 className="text-2xl font-bold tracking-tight">
                  {section.title}
                </h2>

                <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container max-w-6xl py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            What Guides Us
          </span>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Our Core Values
          </h2>

          <p className="mt-4 text-muted-foreground">
            These principles shape how we teach, learn, communicate, and serve
            our students.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border bg-background p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                ✓
              </div>

              <h3 className="text-lg font-semibold">{value.title}</h3>

              <p className="mt-3 leading-7 text-muted-foreground">
                {value.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Commitment */}
      <section className="bg-blue-50">
        <div className="container max-w-5xl py-16 sm:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Our Commitment
              </span>

              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Your Growth Matters to Us
              </h2>
            </div>

            <div>
              <p className="leading-8 text-muted-foreground">
                We are committed to providing students with a supportive and
                purposeful learning experience. From the first lesson to
                continued study, we want every student to feel encouraged,
                valued, and equipped to continue growing in knowledge and
                practice.
              </p>

              <p className="mt-4 leading-8 text-muted-foreground">
                We believe that beneficial knowledge should lead to positive
                transformation — strengthening our relationship with Allah,
                improving our character, and benefiting our families and
                communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container max-w-6xl py-16 sm:py-24">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 px-6 py-14 text-center text-white sm:px-12">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Your Journey with the Qur&apos;an Can Begin Today
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-blue-100">
            Whether you are beginning your Qur&apos;an journey, improving your
            recitation, memorising the Qur&apos;an, or seeking deeper Islamic
            knowledge, AlFawz Academy is here to support your learning journey.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/courses"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-900 transition hover:bg-blue-50"
            >
              Explore Our Courses
            </a>

            <a
              href="/register"
              className="rounded-lg border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Join AlFawz Academy
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

