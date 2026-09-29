import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { TeacherForm } from "@/components/admin/teacher-form";
import { upsertTeacher, deleteTeacher } from "@/app/admin/teachers/actions";
import { Button } from "@/components/ui/button";

export default async function EditTeacherPage({ params }: { params: { id: string } }) {
  const teacher = await prisma.teacher.findUnique({ where: { id: params.id } });
  if (!teacher) notFound();

  const action = upsertTeacher.bind(null, teacher.id);

  async function handleDelete() {
    "use server";
    await deleteTeacher(teacher!.id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 max-w-xl">
        <h1 className="text-2xl font-bold">Edit Teacher</h1>
        <form action={handleDelete}>
          <Button variant="destructive" size="sm" type="submit">Deactivate</Button>
        </form>
      </div>
      <TeacherForm
        action={action}
        submitLabel="Save Changes"
        defaults={{
          name: teacher.name,
          qualification: teacher.qualification,
          specialization: teacher.specialization,
          biography: teacher.biography,
          photo: teacher.photo,
          active: teacher.active,
        }}
      />
    </div>
  );
}
