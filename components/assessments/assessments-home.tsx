import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssessmentForm } from "@/components/assessments/assessment-form";
import { GradingSchemeForm } from "@/components/assessments/grading-scheme-form";
import { finalizeOverdueForCourse } from "@/lib/assessment/service";
import { formatAcademyDateTime } from "@/lib/utils/datetime";

const KIND_LABEL = { QUIZ: "Quiz", TEST: "Test", EXAM: "Final exam" } as const;
const STATUS_LABEL = { DRAFT: "Draft", PUBLISHED: "Open", CLOSED: "Closed" } as const;

/** Shared by the admin and teacher pages: list, create, grading scheme. `base` is /admin/courses/ID or /teacher/courses/ID. */
export async function AssessmentsHome({ courseId, base }: { courseId: string; base: string }) {
  await finalizeOverdueForCourse(courseId);
  const [course, assessments] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId }, select: { caWeight: true, examWeight: true, passMark: true } }),
    prisma.assessment.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true, attempts: true } },
        attempts: { where: { needsMarking: true }, select: { id: true } },
      },
    }),
  ]);
  if (!course) return null;

  return (
    <div className="max-w-3xl space-y-12">
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Quizzes, tests and exams</h2>
          <Button asChild size="sm" variant="outline">
            <Link href={`${base}/assessments/results`}>Results and final grades</Link>
          </Button>
        </div>
        <div className="space-y-3">
          {assessments.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {KIND_LABEL[a.kind]} · {a.durationMinutes} min · {a._count.questions}{" "}
                    {a._count.questions === 1 ? "question" : "questions"} · {a._count.attempts}{" "}
                    {a._count.attempts === 1 ? "attempt" : "attempts"}
                  </p>
                  {(a.opensAt || a.closesAt) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {a.opensAt ? `Opens ${formatAcademyDateTime(a.opensAt)}` : ""}
                      {a.opensAt && a.closesAt ? " · " : ""}
                      {a.closesAt ? `Closes ${formatAcademyDateTime(a.closesAt)}` : ""} (WAT)
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant={a.status === "PUBLISHED" ? "default" : "muted"}>{STATUS_LABEL[a.status]}</Badge>
                    {a.attempts.length > 0 && <Badge variant="gold">{a.attempts.length} to mark</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${base}/assessments/${a.id}`}>Open</Link>
                  </Button>
                  {a._count.attempts > 0 && (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`${base}/assessments/${a.id}/marking`}>Marking</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {assessments.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing yet. Create the first one below.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Create a new one</h2>
        <AssessmentForm courseId={courseId} base={base} />
      </section>

      <section>
        <h2 className="mb-1 font-semibold">Grading scheme</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          The final result is the continuous assessment (all quizzes and tests, plus the average recitation rating) and the final exam, combined
          using these weights. The two weights must add up to 100.
        </p>
        <GradingSchemeForm courseId={courseId} caWeight={course.caWeight} examWeight={course.examWeight} passMark={course.passMark} />
      </section>
    </div>
  );
}
