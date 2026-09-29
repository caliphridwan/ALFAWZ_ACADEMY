import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin } from "lucide-react";
import { JsonLd } from "@/components/shared/json-ld";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming Islamic educational events, lectures and community sessions from AlFawz Academy.",
};

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { published: true },
    orderBy: { date: "asc" },
  });

  const now = new Date();
  const upcoming = events.filter((e) => e.date >= now);
  const past = events.filter((e) => e.date < now);

  return (
    <div className="container py-16">
      {upcoming.map((e) => (
        <JsonLd
          key={e.id}
          data={{
            "@context": "https://schema.org",
            "@type": "Event",
            name: e.title,
            startDate: e.date.toISOString(),
            location: {
              "@type": "Place",
              name: e.location,
            },
            description: e.description,
            ...(e.speaker ? { performer: { "@type": "Person", name: e.speaker } } : {}),
          }}
        />
      ))}

      <div className="max-w-2xl mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Events</h1>
        <p className="text-muted-foreground">
          Lectures, community sessions, and special classes from AlFawz Academy.
        </p>
      </div>

      <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
      {upcoming.length === 0 ? (
        <p className="text-muted-foreground mb-12">No upcoming events right now — check back soon.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {upcoming.map((e) => (
            <Card key={e.id} className="overflow-hidden">
              {e.image && (
                <div className="relative aspect-[16/9] bg-brand/5">
                  <Image src={e.image} alt={e.title} fill className="object-cover" />
                </div>
              )}
              <CardContent className="p-6">
                <Badge className="mb-3">{e.date.toLocaleDateString()}</Badge>
                <h3 className="font-semibold text-lg mb-2">{e.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{e.description}</p>
                <div className="text-xs text-muted-foreground space-y-1 mb-4">
                  <p className="flex items-center gap-2"><CalendarDays size={14} /> {e.time}</p>
                  <p className="flex items-center gap-2"><MapPin size={14} /> {e.location}</p>
                  {e.speaker && <p>Speaker: {e.speaker}</p>}
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href="/contact">Register Interest</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Past Events</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
            {past.map((e) => (
              <Card key={e.id}>
                <CardContent className="p-6">
                  <p className="text-xs text-muted-foreground mb-2">{e.date.toLocaleDateString()}</p>
                  <h3 className="font-semibold">{e.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
