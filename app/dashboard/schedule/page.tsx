import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";

export default async function SchedulePage() {
  const session = await getServerSession(authOptions);
  const active = await prisma.enrollment.findMany({
    where: { studentId: session!.user.id, status: "ACTIVE" },
    include: { course: { include: { instructor: true } } },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Schedule</h1>

      {active.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              You have no active courses yet — your class schedule will appear here once enrolled.
            </p>
            <Button asChild size="sm">
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {active.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-5">
                <p className="font-medium">{e.course.title}</p>
                <p className="text-sm text-muted-foreground mb-3">
                  {e.course.instructor?.name ?? "Instructor to be announced"}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays size={16} className="text-brand shrink-0" />
                  {e.course.schedule ? (
                    <span>{e.course.schedule}</span>
                  ) : (
                    <span className="text-muted-foreground">
                      Class time not yet set —{" "}
                      <Link href="/contact" className="text-brand hover:underline">
                        contact us
                      </Link>{" "}
                      to confirm.
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
