import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AlumnusForm } from "@/components/admin/alumnus-form";
import { upsertAlumnus, deleteAlumnus } from "@/app/admin/alumni/actions";
import { Button } from "@/components/ui/button";

export default async function EditAlumnusPage({ params }: { params: { id: string } }) {
  const alumnus = await prisma.alumnus.findUnique({ where: { id: params.id } });
  if (!alumnus) notFound();

  const action = upsertAlumnus.bind(null, alumnus.id);

  async function handleDelete() {
    "use server";
    await deleteAlumnus(alumnus!.id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 max-w-xl">
        <h1 className="text-2xl font-bold">Edit Alumnus</h1>
        <form action={handleDelete}>
          <Button variant="destructive" size="sm" type="submit">Delete</Button>
        </form>
      </div>
      <AlumnusForm
        action={action}
        submitLabel="Save Changes"
        defaults={{
          name: alumnus.name,
          photo: alumnus.photo,
          graduationYear: alumnus.graduationYear,
          program: alumnus.program,
          currentRole: alumnus.currentRole,
          location: alumnus.location,
          story: alumnus.story,
          linkedinUrl: alumnus.linkedinUrl,
          featured: alumnus.featured,
          published: alumnus.published,
        }}
      />
    </div>
  );
}
