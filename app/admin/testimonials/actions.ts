"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validations/schemas";

const testimonialSchema = z.object({
  name: z.string().min(2),
  country: z.string().optional(),
  content: z.string().min(10),
  course: z.string().optional(),
  image: imagePathSchema,
  published: z.boolean().default(false),
});

export type TestimonialFormState = { success: boolean; formError?: string };

export async function upsertTestimonial(
  testimonialId: string | null,
  _prev: TestimonialFormState,
  formData: FormData
): Promise<TestimonialFormState> {
  await requireAdmin();

  const parsed = testimonialSchema.safeParse({
    name: formData.get("name"),
    country: formData.get("country") || undefined,
    content: formData.get("content"),
    course: formData.get("course") || undefined,
    image: formData.get("image") || "",
    published: formData.get("published") === "on",
  });

  if (!parsed.success) return { success: false, formError: "Please check the form for errors." };

  const data = { ...parsed.data, image: parsed.data.image || null };

  if (testimonialId) {
    await prisma.testimonial.update({ where: { id: testimonialId }, data });
  } else {
    await prisma.testimonial.create({ data });
  }

  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  revalidatePath("/");
  return { success: true };
}

export async function deleteTestimonial(testimonialId: string) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id: testimonialId } });
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
}

export async function toggleTestimonialPublished(testimonialId: string, published: boolean) {
  await requireAdmin();
  await prisma.testimonial.update({ where: { id: testimonialId }, data: { published } });
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  revalidatePath("/");
}
