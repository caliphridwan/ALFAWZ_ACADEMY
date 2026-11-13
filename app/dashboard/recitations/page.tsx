import { getServerSession } from "next-auth";
import { Star } from "lucide-react";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Recorder } from "@/components/recitations/recorder";
import { formatAcademyDateTime } from "@/lib/utils/datetime";

export const dynamic = "force-dynamic";

export default async function RecitationsPage() {
  const session = await getServerSession(authOptions);
  const studentId = session!.user.id;

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, status: { in: ["ACTIVE", "COMPLETED"] } },
    select: { courseId: true },
  });
  const courseIds = enrollments.map((e) => e.courseId);

  const tasks = courseIds.length
    ? await prisma.recitationTask.findMany({
        where: { courseId: { in: courseIds } },
        orderBy: { createdAt: "desc" },
        include: {
          course: { select: { title: true } },
          submissions: { where: { studentId } },
        },
      })
    : [];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Recitations</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Record your recitation for each task and send it to your teacher. You&apos;ll get feedback here.
      </p>

      <div className="space-y-4">
        {tasks.map((t) => {
          const mine = t.submissions[0];
          const overdue = !mine && t.dueAt && t.dueAt.getTime() < Date.now();
          return (
            <Card key={t.id}>
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.course.title}</p>
                  </div>
                  {mine?.reviewedAt ? (
                    <Badge variant="default">Reviewed</Badge>
                  ) : mine ? (
                    <Badge variant="gold">Sent — waiting for feedback</Badge>
                  ) : overdue ? (
                    <Badge variant="muted">Past due</Badge>
                  ) : (
                    <Badge variant="gold">To do</Badge>
                  )}
                </div>

                {t.instructions && <p className="text-sm whitespace-pre-line">{t.instructions}</p>}
                {t.dueAt && (
                  <p className="text-xs text-muted-foreground">Due {formatAcademyDateTime(t.dueAt)} (WAT)</p>
                )}

                {mine && (
                  <div className="rounded-md border border-border p-4 space-y-3">
                    <p className="text-xs text-muted-foreground">Your recording</p>
                    <audio controls preload="none" src={mine.audioUrl} className="w-full" />
                    {mine.reviewedAt && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1" aria-label={`Rated ${mine.rating} out of 5`}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              size={18}
                              className={n <= (mine.rating ?? 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        {mine.feedback && <p className="text-sm whitespace-pre-line">{mine.feedback}</p>}
                        {mine.feedbackAudioUrl && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Voice reply from your teacher</p>
                            <audio controls preload="none" src={mine.feedbackAudioUrl} className="w-full" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Recorder taskId={t.id} resubmit={!!mine} />
              </CardContent>
            </Card>
          );
        })}
        {tasks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No recitation tasks yet. When your teacher sets one, it will appear here and you&apos;ll be notified.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
