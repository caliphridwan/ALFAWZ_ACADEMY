import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { TestimonialForm } from "@/components/admin/testimonial-form";
import { upsertTestimonial, deleteTestimonial } from "@/app/admin/testimonials/actions";
import { Button } from "@/components/ui/button";

export default async function EditTestimonialPage({ params }: { params: { id: string } }) {
  const testimonial = await prisma.testimonial.findUnique({ where: { id: params.id } });
  if (!testimonial) notFound();

  const action = upsertTestimonial.bind(null, testimonial.id);

  async function handleDelete() {
    "use server";
    await deleteTestimonial(testimonial!.id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 max-w-xl">
        <h1 className="text-2xl font-bold">Edit Testimonial</h1>
        <form action={handleDelete}>
          <Button variant="destructive" size="sm" type="submit">Delete</Button>
        </form>
      </div>
      <TestimonialForm
        action={action}
        submitLabel="Save Changes"
        defaults={{
          name: testimonial.name,
          country: testimonial.country,
          content: testimonial.content,
          course: testimonial.course,
          image: testimonial.image,
          published: testimonial.published,
        }}
      />
    </div>
  );
}
