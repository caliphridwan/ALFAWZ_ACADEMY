import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { ScholarshipForm } from "@/components/payments/scholarship-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const STATUS_LABEL = { PENDING: "Under review", APPROVED: "Approved", REJECTED: "Not approved" } as const;
const STATUS_VARIANT = { PENDING: "gold", APPROVED: "default", REJECTED: "muted" } as const;

export default async function ScholarshipPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [courses, applications] = await Promise.all([
    prisma.course.findMany({
      where: { active: true },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.scholarshipApplication.findMany({
      where: { studentId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { course: { select: { title: true } } },
    }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Scholarship application</h1>
      <p className="text-sm text-muted-foreground mb-6">
        AlFawz Academy offers sponsored places to students who can&apos;t afford the fee. Tell us a little about your
        situation and we&apos;ll review it.
      </p>

      {courses.length > 0 && <ScholarshipForm courses={courses} />}

      {applications.length > 0 && (
        <>
          <h2 className="font-semibold mt-12 mb-3">Your applications</h2>
          <div className="space-y-3">
            {applications.map((a) => (
              <Card key={a.id}>
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{a.course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Sent {a.createdAt.toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" })}
                    </p>
                    {a.status === "REJECTED" && a.reviewNote && (
                      <p className="mt-1 text-sm text-muted-foreground">{a.reviewNote}</p>
                    )}
                  </div>
                  <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
