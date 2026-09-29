import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({ orderBy: { date: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button asChild>
          <Link href="/admin/events/new">Create Event</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr><th className="p-4">Title</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="p-4 font-medium">{e.title}</td>
                  <td className="p-4 text-muted-foreground">{e.date.toLocaleDateString()}</td>
                  <td className="p-4"><Badge variant={e.published ? "default" : "muted"}>{e.published ? "Published" : "Draft"}</Badge></td>
                  <td className="p-4 text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/events/${e.id}/edit`}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No events yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
