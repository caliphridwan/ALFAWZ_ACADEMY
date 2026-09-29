import { prisma } from "@/lib/db/prisma";
import { CourseForm } from "@/components/admin/course-form";
import { createCourse } from "@/app/admin/courses/actions";

export default async function NewCoursePage() {
  const teachers = await prisma.teacher.findMany({
    where: { active: true },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Course</h1>
      <CourseForm action={createCourse} teachers={teachers} submitLabel="Create Course" />
    </div>
  );
}
