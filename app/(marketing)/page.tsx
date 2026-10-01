import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import { Hero } from "@/components/marketing/hero";
import { StatsSection } from "@/components/marketing/stats-section";
import { CourseCard } from "@/components/courses/course-card";
import { SponsorshipCta } from "@/components/marketing/sponsorship-cta";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const [settings, featuredCourses, testimonials] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.course.findMany({
      where: { active: true },
      take: 3,
      orderBy: { createdAt: "asc" },
      include: { instructor: true },
    }),
    prisma.testimonial.findMany({ where: { published: true }, take: 3 }),
  ]);

  return (
    <>
      <Hero imageUrl={settings?.heroImageUrl} />
      <StatsSection stats={settings} />

      {/* Introduction */}
      <section className="container py-20 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Why AlFawz Academy</h2>
        <p className="text-muted-foreground">
          To make authentic Islamic education accessible to Muslims
          everywhere through structured, well-detailed, and engaging online
          classes — for children, youth, and adults, wherever they are in
          the world.
        </p>
      </section>

      {/* Featured courses */}
      <section className="container pb-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Featured Courses</h2>
          <Button asChild variant="link">
            <Link href="/courses">View all courses →</Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <CourseCard
              key={course.id}
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
          ))}
        </div>
      </section>

      <SponsorshipCta />

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="container py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            What Our Students Say
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <blockquote
                key={t.id}
                className="rounded-lg border border-border p-6 bg-card"
              >
                <p className="text-sm text-muted-foreground mb-4">&ldquo;{t.content}&rdquo;</p>
                <footer className="flex items-center gap-3">
                  {t.image && (
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 bg-brand/10">
                      <Image src={t.image} alt={t.name} fill className="object-cover" />
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {t.name}
                    {t.country ? <span className="text-muted-foreground font-normal">, {t.country}</span> : null}
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="container py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">
          Ready to begin your journey with the Qur&apos;an?
        </h2>
        <Button asChild size="lg">
          <Link href="/register">Enroll Now</Link>
        </Button>
      </section>
    </>
  );
}
