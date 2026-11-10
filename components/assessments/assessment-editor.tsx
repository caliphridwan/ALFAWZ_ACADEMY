import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssessmentForm } from "@/components/assessments/assessment-form";
import { QuestionEditor, type QuestionView } from "@/components/assessments/question-editor";
import { StatusControls } from "@/components/assessments/status-controls";
import { toAcademyInputValue } from "@/lib/utils/datetime";

const STATUS_LABEL = { DRAFT: "Draft", PUBLISHED: "Open to students", CLOSED: "Closed" } as const;

/** Shared by the admin and teacher pages. The caller has already checked the course belongs to the viewer. */
export async function AssessmentEditor({ assessmentId, courseId, base }: { assessmentId: string; courseId: string; base: string }) {
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, courseId },
    include: {
      questions: { orderBy: { position: "asc" } },
      _count: { select: { attempts: true } },
    },
  });
  if (!assessment) notFound();

  const questions: QuestionView[] = assessment.questions.map((q) => ({
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    options: Array.isArray(q.options) ? (q.options as unknown[]).map((o) => String(o)) : [],
    correct: q.correct ?? "",
    points: q.points,
  }));

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={assessment.status === "PUBLISHED" ? "default" : "muted"}>{STATUS_LABEL[assessment.status]}</Badge>
          {assessment._count.attempts > 0 && (
            <Button asChild size="sm" variant="outline">
              <Link href={`${base}/assessments/${assessment.id}/marking`}>
                Marking ({assessment._count.attempts} {assessment._count.attempts === 1 ? "attempt" : "attempts"})
              </Link>
            </Button>
          )}
        </div>
        <div className="mt-4">
          <StatusControls assessmentId={assessment.id} status={assessment.status} backHref={`${base}/assessments`} />
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-semibold">Questions</h2>
        <QuestionEditor assessmentId={assessment.id} questions={questions} locked={assessment._count.attempts > 0} />
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Details</h2>
        <AssessmentForm
          courseId={courseId}
          base={base}
          assessmentId={assessment.id}
          defaults={{
            title: assessment.title,
            instructions: assessment.instructions ?? "",
            kind: assessment.kind,
            durationMinutes: assessment.durationMinutes,
            opensAt: toAcademyInputValue(assessment.opensAt),
            closesAt: toAcademyInputValue(assessment.closesAt),
            shuffleQuestions: assessment.shuffleQuestions,
          }}
        />
      </section>
    </div>
  );
}
