import { TestimonialForm } from "@/components/admin/testimonial-form";
import { upsertTestimonial } from "@/app/admin/testimonials/actions";

export default function NewTestimonialPage() {
  const action = upsertTestimonial.bind(null, null);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add Testimonial</h1>
      <TestimonialForm action={action} submitLabel="Add Testimonial" />
    </div>
  );
}
