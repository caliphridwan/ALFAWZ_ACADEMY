"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validations/schemas";

const eventSchema = z.object({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  date: z.coerce.date(),
  time: z.string().min(1),
  location: z.string().min(1),
  speaker: z.string().optional(),
  image: imagePathSchema,
  published: z.boolean().default(true),
});

export type EventFormState = { success: boolean; formError?: string };

export async function upsertEvent(
  eventId: string | null,
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  await requireAdmin();

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    date: formData.get("date"),
    time: formData.get("time"),
    location: formData.get("location"),
    speaker: formData.get("speaker") || undefined,
    image: formData.get("image") || "",
    published: formData.get("published") === "on",
  });

  if (!parsed.success) return { success: false, formError: "Please check the form for errors." };

  const data = { ...parsed.data, image: parsed.data.image || null };

  if (eventId) {
    await prisma.event.update({ where: { id: eventId }, data });
  } else {
    const existing = await prisma.event.findUnique({ where: { slug: data.slug } });
    if (existing) return { success: false, formError: "An event with this slug already exists." };
    await prisma.event.create({ data });
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  await requireAdmin();
  await prisma.event.delete({ where: { id: eventId } });
  revalidatePath("/admin/events");
  revalidatePath("/events");
}
