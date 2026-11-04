import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScholarshipActions } from "@/components/admin/review-actions";

export const dynamic = "force-dynamic";

export default async function AdminScholarshipsPage() {
  const [pending, recent] = await Promise.all([
    prisma.scholarshipApplication.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        student: { select: { name: true, email: true, country: true } },
        course: { select: { title: true } },
      },
    }),
    prisma.scholarshipApplication.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { reviewedAt: "desc" },
      take: 15,
      include: { student: { select: { name: true } }, course: { select: { title: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Scholarship Applications</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        Approving enrols the student for free (recorded as a scholarship, not revenue). Declining sends them a polite
        notification with your reason.
      </p>

      <h2 className="font-semibold mb-3">Waiting for review ({pending.length})</h2>
      <div className="space-y-4 max-w-3xl">
        {pending.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{a.student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.student.email}
                    {a.student.country ? ` · ${a.student.country}` : ""}
                  </p>
                </div>
                <Badge variant="gold">{a.course.title}</Badge>
              </div>
              <p className="text-sm whitespace-pre-line">{a.reason}</p>
              <ScholarshipActions applicationId={a.id} />
            </CardContent>
          </Card>
        ))}
        {pending.length === 0 && <p className="text-sm text-muted-foreground">No applications waiting.</p>}
      </div>

      {recent.length > 0 && (
        <>
          <h2 className="font-semibold mt-12 mb-3">Recently reviewed</h2>
          <div className="space-y-2 max-w-3xl">
            {recent.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-3 text-sm">
                <span>
                  {a.student.name} — {a.course.title}
                </span>
                <Badge variant={a.status === "APPROVED" ? "default" : "muted"}>
                  {a.status === "APPROVED" ? "Approved" : "Declined"}
                </Badge>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
