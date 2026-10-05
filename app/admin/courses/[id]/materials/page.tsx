import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { MaterialForm } from "@/components/admin/material-form";
import { DeleteMaterialButton } from "@/components/admin/delete-material-button";
import { addMaterial, type MaterialFormState } from "./actions";

export default async function CourseMaterialsPage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: { materials: { orderBy: { uploadedAt: "desc" } } },
  });

  if (!course) notFound();

  async function addMaterialForThisCourse(prevState: MaterialFormState, formData: FormData) {
    "use server";
    return addMaterial(course!.id, prevState, formData);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Class Materials</h1>
      <p className="text-muted-foreground mb-8">{course.title}</p>

      <h2 className="font-semibold mb-3">Add Material</h2>
      <MaterialForm action={addMaterialForThisCourse} />

      <h2 className="font-semibold mb-3 mt-10">Existing Materials</h2>
      <div className="space-y-3 max-w-xl">
        {course.materials.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{m.title}</p>
                {m.description && (
                  <p className="text-sm text-muted-foreground truncate">{m.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {m.uploadedAt.toLocaleDateString()}
                </p>
              </div>
              <DeleteMaterialButton materialId={m.id} courseId={course.id} />
            </CardContent>
          </Card>
        ))}
        {course.materials.length === 0 && (
          <p className="text-muted-foreground text-sm">No materials uploaded yet for this course.</p>
        )}
      </div>
    </div>
  );
}
