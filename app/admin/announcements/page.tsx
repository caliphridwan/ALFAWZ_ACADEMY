import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnnouncementForm } from "@/components/admin/announcement-form";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const [courses, history] = await Promise.all([
    prisma.course.findMany({
      where: { active: true },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { course: { select: { title: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Announcements</h1>
      <AnnouncementForm courses={courses} />

      <h2 className="font-semibold mt-12 mb-3">Recently sent</h2>
      <div className="space-y-3 max-w-2xl">
        {history.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">{a.title}</p>
                <Badge variant="muted">{a.course?.title ?? "All students"}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">{a.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {a.createdAt.toLocaleString("en-GB", { timeZone: "Africa/Lagos" })} · {a.recipients} recipients
              </p>
            </CardContent>
          </Card>
        ))}
        {history.length === 0 && <p className="text-sm text-muted-foreground">Nothing sent yet.</p>}
      </div>
    </div>
  );
}
