import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type EventPreviewItem = {
  id: string;
  title: string;
  date: Date;
  location: string;
  image: string | null;
};

export function EventsPreview({ events }: { events: EventPreviewItem[] }) {
  if (events.length === 0) return null;

  return (
    <section className="container py-20">
      <div className="flex items-end justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold">Upcoming Events</h2>
        <Button asChild variant="link">
          <Link href="/events">View all events →</Link>
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((e) => (
          <Card key={e.id} className="overflow-hidden">
            {e.image && (
              <div className="relative aspect-[16/9] bg-brand/5">
                <Image src={e.image} alt={e.title} fill className="object-cover" />
              </div>
            )}
            <CardContent className="p-5">
              <Badge className="mb-3">{e.date.toLocaleDateString()}</Badge>
              <h3 className="font-semibold mb-1">{e.title}</h3>
              <p className="text-sm text-muted-foreground">{e.location}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
