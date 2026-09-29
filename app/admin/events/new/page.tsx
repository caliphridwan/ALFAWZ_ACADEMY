import { EventForm } from "@/components/admin/event-form";
import { upsertEvent } from "@/app/admin/events/actions";

export default function NewEventPage() {
  const action = upsertEvent.bind(null, null);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>
      <EventForm action={action} submitLabel="Create Event" />
    </div>
  );
}
