import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkingForm, type MarkRow } from "@/components/assessments/marking-form";
import { finalizeOverdueAttempts } from "@/lib/assessment/service";
import { isManualQuestion, percent } from "@/lib/assessment/grading";
import { formatAcademyDateTime } from "@/lib/utils/datetime";

/** Shared by the admin and teacher pages: every submitted attempt, with the written answers to mark. */
export async function MarkingView({ assessmentId, courseId }: { assessmentId: string; courseId: string }) {
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, courseId },
    select: { id: true, title: true },
  });
  if (!assessment) notFound();

  // Anyone whose time ran out without pressing submit is closed off first.
  await finalizeOverdueAttempts({ assessmentId });

  const attempts = await prisma.assessmentAttempt.findMany({
    where: { assessmentId, status: { in: ["SUBMITTED", "GRADED"] } },
    orderBy: [{ needsMarking: "desc" }, { submittedAt: "desc" }],
    include: {
      student: { select: { name: true } },
      answers: { include: { question: true } },
    },
  });

  if (attempts.length === 0) {
    return <p className="text-sm text-muted-foreground">No one has submitted this yet.</p>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      {attempts.map((attempt) => {
        const answers = [...attempt.answers].sort((a, b) => a.question.position - b.question.position);
        const rows: MarkRow[] = answers.map((a) => {
          const q = a.question;
          const blank = (a.response ?? "").trim() === "";
          const manual = isManualQuestion(q);
          let correctText: string | null = null;
          if (q.type === "MULTIPLE_CHOICE" && Array.isArray(q.options)) {
            correctText = String((q.options as unknown[])[Number(q.correct)] ?? "");
          } else if (q.type === "TRUE_FALSE") {
            correctText = q.correct === "true" ? "True" : "False";
          } else if (q.type === "SHORT_ANSWER" && q.correct) {
            correctText = q.correct.split("|").map((s) => s.trim()).filter(Boolean).join(", ");
          }
          // For multiple choice, show the choice's wording rather than its position.
          let response = a.response ?? "";
          if (q.type === "MULTIPLE_CHOICE" && Array.isArray(q.options) && response !== "") {
            response = String((q.options as unknown[])[Number(response)] ?? response);
          } else if (q.type === "TRUE_FALSE" && response !== "") {
            response = response === "true" ? "True" : "False";
          }
          return {
            answerId: a.id,
            prompt: q.prompt,
            type: q.type,
            points: q.points,
            response,
            autoMarked: !manual || blank,
            score: a.score,
            feedback: a.feedback ?? "",
            correctText,
          };
        });

        return (
          <Card key={attempt.id}>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{attempt.student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {attempt.submittedAt ? `Submitted ${formatAcademyDateTime(attempt.submittedAt)} (WAT)` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {attempt.score} / {attempt.maxScore} ({percent(attempt.score, attempt.maxScore)}%)
                  </span>
                  {attempt.needsMarking ? <Badge variant="gold">To mark</Badge> : <Badge>Marked</Badge>}
                </div>
              </div>
              <MarkingForm attemptId={attempt.id} rows={rows} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
