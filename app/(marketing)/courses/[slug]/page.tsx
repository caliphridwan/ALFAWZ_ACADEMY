import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { EnrollButton } from "@/components/courses/enroll-button";
import { formatCurrency } from "@/lib/utils/cn";
import { JsonLd } from "@/components/shared/json-ld";

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

  return (
    <article className="container py-16 grid lg:grid-cols-3 gap-12">
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
            availability: course.enrollmentOpen
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
        <Badge className="mb-4">{course.level}</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{course.title}</h1>
        <p className="text-muted-foreground text-lg mb-8">{course.description}</p>

        {curriculum.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Curriculum</h2>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              {curriculum.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {requirements.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Requirements</h2>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              {requirements.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {course.instructor && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Instructor</h2>
            <p className="font-medium">{course.instructor.name}</p>
            {course.instructor.specialization && (
              <p className="text-sm text-muted-foreground">{course.instructor.specialization}</p>
            )}
          </section>
        )}

        {faqs.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">FAQs</h2>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <div key={i}>
                  <p className="font-medium">{f.q}</p>
                  <p className="text-sm text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 h-fit rounded-xl border border-border bg-card p-6 space-y-4">
        <p className="text-3xl font-bold text-brand">
          {formatCurrency(Number(course.price), course.currency)}
        </p>
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
        {course.enrollmentOpen ? (
          <EnrollButton courseId={course.id} courseSlug={course.slug} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Enrollment is currently closed for this course.
          </p>
        )}
      </aside>
    </article>
  );
}
