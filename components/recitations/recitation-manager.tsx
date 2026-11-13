import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatAcademyDateTime } from "@/lib/utils/datetime";
import { RecitationTaskForm } from "@/components/recitations/task-form";
import { DeleteTaskButton, ReviewForm } from "@/components/recitations/review-form";

/** Shared by the admin and teacher pages: set tasks, listen, give feedback. */
export async function RecitationManager({ courseId }: { courseId: string }) {
  const tasks = await prisma.recitationTask.findMany({
    where: { courseId },
    orderBy: { createdAt: "desc" },
    include: {
      submissions: {
        orderBy: { submittedAt: "desc" },
        include: { student: { select: { name: true } } },
      },
    },
  });

  return (
    <div>
      <h2 className="font-semibold mb-3">Set a new task</h2>
      <RecitationTaskForm courseId={courseId} />

      <h2 className="font-semibold mt-12 mb-3">Tasks and recordings</h2>
      <div className="space-y-6 max-w-3xl">
        {tasks.map((t) => {
          const waiting = t.submissions.filter((s) => !s.reviewedAt).length;
          return (
            <Card key={t.id}>
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    {t.instructions && (
                      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">{t.instructions}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.dueAt ? `Due ${formatAcademyDateTime(t.dueAt)} (WAT) · ` : ""}
                      {t.submissions.length} {t.submissions.length === 1 ? "recording" : "recordings"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {waiting > 0 && <Badge variant="gold">{waiting} to review</Badge>}
                    <DeleteTaskButton taskId={t.id} />
                  </div>
                </div>

                {t.submissions.map((s) => (
                  <div key={s.id} className="rounded-md border border-border p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">{s.student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatAcademyDateTime(s.submittedAt)} (WAT)
                        {s.durationSec ? ` · ${Math.floor(s.durationSec / 60)}:${String(s.durationSec % 60).padStart(2, "0")}` : ""}
                      </p>
                    </div>
                    <audio controls preload="none" src={s.audioUrl} className="w-full" />
                    {s.note && <p className="text-sm text-muted-foreground">“{s.note}”</p>}
                    <ReviewForm submissionId={s.id} initialRating={s.rating} initialFeedback={s.feedback} initialAudioUrl={s.feedbackAudioUrl} />
                  </div>
                ))}
                {t.submissions.length === 0 && (
                  <p className="text-sm text-muted-foreground">No recordings yet.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
        {tasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks set yet.</p>}
      </div>
    </div>
  );
}
