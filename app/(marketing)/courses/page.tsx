import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { CourseCard } from "@/components/courses/course-card";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Explore AlFawz Academy's Qur'an and Islamic education courses — from beginner recitation to advanced Tafseer, for all ages.",
};

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
    include: { instructor: true },
  });

  return (
    <div className="container py-16">
      <div className="max-w-2xl mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Our Courses</h1>
        <p className="text-muted-foreground">
          Structured Qur&apos;an and Islamic education programs for every age
          and level, taught by qualified teachers, delivered online.
        </p>
      </div>

      {courses.length === 0 ? (
        <p className="text-muted-foreground">
          No courses are available right now — please check back soon.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <ScrollReveal key={course.id} delay={(i % 3) * 0.08}>
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
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
