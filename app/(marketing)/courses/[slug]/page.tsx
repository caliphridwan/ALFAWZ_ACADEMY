import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Check, ChevronDown, Clock, GraduationCap, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EnrollmentGate } from "@/components/courses/enrollment-gate";
import { CurrencyConverter } from "@/components/courses/currency-converter";
import { getExchangeRates } from "@/lib/currency/exchange-rates";
import { formatCurrency } from "@/lib/utils/cn";
import { JsonLd } from "@/components/shared/json-ld";
import { BankTransferDetails } from "@/components/payments/bank-transfer-details";
import { getBankTransferInfo } from "@/lib/bank-details";

type Props = { params: { slug: string } };

async function getCourse(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: { instructor: true },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourse(params.slug);
  if (!course) return { title: "Course not found" };
  return {
    title: course.title,
    description: course.shortDescription,
    openGraph: course.image ? { images: [course.image] } : undefined,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const course = await getCourse(params.slug);
  if (!course || !course.active) notFound();

  const curriculum = Array.isArray(course.curriculum) ? (course.curriculum as string[]) : [];
  const requirements = Array.isArray(course.requirements) ? (course.requirements as string[]) : [];
  const faqs = Array.isArray(course.faqs) ? (course.faqs as { q: string; a: string }[]) : [];

  const closesAtPassedOnServer = course.registrationClosesAt
    ? course.registrationClosesAt.getTime() <= Date.now()
    : false;
  const registrationOpen = course.enrollmentOpen && !closesAtPassedOnServer;

  // Currency conversion is only shown on the Diaspora program(s), per the
  // intent that this is for students/parents abroad comparing against a
  // currency they actually think in — not a general feature on every
  // course page. Matches on slug or title so an admin naming a future
  // course "Diaspora ..." picks this up automatically.
  const isDiasporaCourse =
    course.slug.toLowerCase().includes("diaspora") || course.title.toLowerCase().includes("diaspora");
  const exchangeRates = isDiasporaCourse ? await getExchangeRates(course.currency) : null;
  const bankInfo = registrationOpen ? await getBankTransferInfo() : null;

  return (
    <article className="container py-12 sm:py-16 grid lg:grid-cols-3 gap-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: course.shortDescription,
          provider: {
            "@type": "EducationalOrganization",
            name: "AlFawz Academy",
            url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          },
          ...(course.instructor
            ? { instructor: { "@type": "Person", name: course.instructor.name } }
            : {}),
          offers: {
            "@type": "Offer",
            price: Number(course.price),
            priceCurrency: course.currency,
            availability: registrationOpen
              ? "https://schema.org/InStock"
              : "https://schema.org/SoldOut",
          },
        }}
      />
      <div className="lg:col-span-2">
        {course.image && (
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-6 bg-brand/5">
            <Image src={course.image} alt={course.title} fill className="object-cover" priority />
          </div>
        )}
        <Link href="/courses" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
          ← All courses
        </Link>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge>{course.level}</Badge>
          <Badge variant={registrationOpen ? "gold" : "muted"}>
            {registrationOpen ? "Enrolment open" : "Enrolment closed"}
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">{course.title}</h1>
        <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><Clock size={16} className="text-brand" /> {course.duration}</span>
          <span className="inline-flex items-center gap-2"><Users size={16} className="text-brand" /> {course.ageGroup}</span>
          <span className="inline-flex items-center gap-2"><GraduationCap size={16} className="text-brand" /> Certificate on completion</span>
        </div>
        <p className="text-muted-foreground text-lg leading-8 mb-10 whitespace-pre-line">{course.description}</p>

        {curriculum.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-5">What you will learn</h2>
            <ol className="grid gap-3 sm:grid-cols-2">
              {curriculum.map((item, i) => (
                <li key={i} className="flex gap-3 rounded-xl border border-border/70 bg-card p-4 text-sm">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                    {i + 1}
                  </span>
                  <span className="leading-6">{item}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {requirements.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-5">Before you start</h2>
            <ul className="space-y-3">
              {requirements.map((item, i) => (
                <li key={i} className="flex gap-3 text-muted-foreground">
                  <Check size={18} className="mt-1 shrink-0 text-gold" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {course.instructor && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-5">Your teacher</h2>
            <div className="flex gap-4 rounded-xl border border-border/70 bg-card p-5">
              {course.instructor.photo ? (
                <Image
                  src={course.instructor.photo}
                  alt={course.instructor.name}
                  width={80}
                  height={80}
                  className="h-20 w-20 shrink-0 rounded-full border-2 border-gold/50 object-cover"
                />
              ) : (
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand text-2xl font-bold text-brand-foreground">
                  {course.instructor.name.trim()[0]?.toUpperCase()}
                </span>
              )}
              <div>
                <p className="text-lg font-semibold">{course.instructor.name}</p>
                {course.instructor.qualification && (
                  <p className="text-sm text-brand">{course.instructor.qualification}</p>
                )}
                {course.instructor.specialization && (
                  <p className="text-sm text-muted-foreground">{course.instructor.specialization}</p>
                )}
                {course.instructor.biography && (
                  <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted-foreground">
                    {course.instructor.biography}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {faqs.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-5">Questions parents ask</h2>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <details key={i} className="group rounded-xl border border-border/70 bg-card p-4 open:shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                    {f.q}
                    <ChevronDown size={18} className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-border/70 border-t-4 border-t-gold bg-card p-6 space-y-4 shadow-lg shadow-brand/5">
        <p className="text-4xl font-bold text-brand">
          {formatCurrency(Number(course.price), course.currency)}
        </p>
        {isDiasporaCourse && (
          <CurrencyConverter
            amount={Number(course.price)}
            baseCurrency={course.currency}
            rates={exchangeRates}
          />
        )}
        <dl className="text-sm space-y-2 text-muted-foreground">
          <div className="flex justify-between">
            <dt>Duration</dt>
            <dd className="text-foreground">{course.duration}</dd>
          </div>
          {course.schedule && (
            <div className="flex justify-between">
              <dt>Class schedule</dt>
              <dd className="text-foreground text-right">{course.schedule}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>Age group</dt>
            <dd className="text-foreground">{course.ageGroup}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Level</dt>
            <dd className="text-foreground">{course.level}</dd>
          </div>
        </dl>
        <EnrollmentGate
          courseId={course.id}
          courseSlug={course.slug}
          enrollmentOpen={course.enrollmentOpen}
          closesAt={course.registrationClosesAt ? course.registrationClosesAt.toISOString() : null}
          closesAtPassedOnServer={closesAtPassedOnServer}
        />
        <BankTransferDetails
          info={bankInfo}
          purpose={course.title}
          compact
          claimHref={`/dashboard/bank-transfer?course=${course.id}`}
        />
      </aside>
    </article>
  );
}
