import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { EventForm } from "@/components/admin/event-form";
import { upsertEvent, deleteEvent } from "@/app/admin/events/actions";
import { Button } from "@/components/ui/button";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) notFound();

  const action = upsertEvent.bind(null, event.id);

  async function handleDelete() {
    "use server";
    await deleteEvent(event!.id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 max-w-xl">
        <h1 className="text-2xl font-bold">Edit Event</h1>
        <form action={handleDelete}>
          <Button variant="destructive" size="sm" type="submit">Delete</Button>
        </form>
      </div>
      <EventForm
        action={action}
        submitLabel="Save Changes"
        defaults={{
          title: event.title,
          slug: event.slug,
          description: event.description,
          date: event.date.toISOString().slice(0, 10),
          time: event.time,
          location: event.location,
          speaker: event.speaker,
          image: event.image,
          published: event.published,
        }}
      />
    </div>
  );
}
