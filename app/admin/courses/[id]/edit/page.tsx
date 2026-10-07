import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { CourseForm } from "@/components/admin/course-form";
import { updateCourse, type CourseFormState } from "@/app/admin/courses/actions";

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const [course, teachers] = await Promise.all([
    prisma.course.findUnique({ where: { id: params.id } }),
    prisma.teacher.findMany({ where: { active: true }, select: { id: true, name: true } }),
  ]);

  if (!course) notFound();

  // Bind the course id server-side so the client form only ever posts the
  // editable fields — the id being edited isn't something the client
  // chooses.
  async function updateThisCourse(prevState: CourseFormState, formData: FormData) {
    "use server";
    return updateCourse(course!.id, prevState, formData);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
      <CourseForm
        action={updateThisCourse}
        teachers={teachers}
        submitLabel="Save Changes"
        defaults={{
          title: course.title,
          slug: course.slug,
          shortDescription: course.shortDescription,
          description: course.description,
          price: Number(course.price),
          currency: course.currency,
          duration: course.duration,
          schedule: course.schedule,
          zoomLink: course.zoomLink,
          level: course.level,
          ageGroup: course.ageGroup,
          category: course.category,
          instructorId: course.instructorId,
          image: course.image,
          active: course.active,
          enrollmentOpen: course.enrollmentOpen,
        }}
      />
    </div>
  );
}
