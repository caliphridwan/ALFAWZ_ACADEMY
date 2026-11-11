import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { courseResults, finalizeOverdueAttempts } from "@/lib/assessment/service";
import { gradeLetter, percent } from "@/lib/assessment/grading";
import { formatAcademyDateTime } from "@/lib/utils/datetime";

export const dynamic = "force-dynamic";

const KIND_LABEL = { QUIZ: "Quiz", TEST: "Test", EXAM: "Final exam" } as const;

export default async function StudentAssessmentsPage() {
  const session = await getServerSession(authOptions);
  const studentId = session!.user.id;

  // Close off anything whose time ran out while the student was away.
  await finalizeOverdueAttempts({ studentId });

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, status: { in: ["ACTIVE", "COMPLETED"] } },
    select: {
      courseId: true,
      examResult: true,
      finalScore: true,
      course: {
        select: {
          title: true,
          passMark: true,
          assessments: {
            where: { status: { in: ["PUBLISHED", "CLOSED"] } },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              title: true,
              kind: true,
              status: true,
              durationMinutes: true,
              opensAt: true,
              closesAt: true,
              attempts: {
                where: { studentId },
                select: { status: true, score: true, maxScore: true },
              },
            },
          },
        },
      },
    },
  });

  const now = Date.now();
  const withResults = await Promise.all(
    enrollments.map(async (e) => ({ e, results: (await courseResults(e.courseId, studentId))[0] ?? null }))
  );

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold">Assessments</h1>
      <p className="mb-8 text-sm text-muted-foreground">Quizzes, tests and exams for your courses, and how your final result is worked out.</p>

      {withResults.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">Enrol in a course to see its assessments here.</CardContent>
        </Card>
      )}

      <div className="space-y-10">
        {withResults.map(({ e, results }) => (
          <section key={e.courseId}>
            <h2 className="mb-3 text-lg font-semibold">{e.course.title}</h2>

            {e.examResult && (
              <Card className="mb-4 border-brand/40">
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">Final result</p>
                  <p className="mt-1 text-2xl font-bold">
                    {e.finalScore !== null ? `${Math.round(e.finalScore * 10) / 10}% (${gradeLetter(e.finalScore)})` : ""}{" "}
                    <span className={e.examResult === "PASSED" ? "text-brand" : "text-muted-foreground"}>
                      {e.examResult === "PASSED" ? "Passed" : "Not passed"}
                    </span>
                  </p>
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link href={`/dashboard/assessments/slip/${e.courseId}`}>Print result slip</Link>
                  </Button>
                  {results && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Continuous assessment {results.ca === null ? "—" : `${results.ca}%`} · Exam {results.exam === null ? "—" : `${results.exam}%`} · Pass mark {e.course.passMark}%
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {e.course.assessments.map((a) => {
                const attempt = a.attempts[0];
                const ended = a.status === "CLOSED" || (a.closesAt !== null && a.closesAt.getTime() < now);
                const notYet = a.opensAt !== null && a.opensAt.getTime() > now;

                let state: React.ReactNode;
                let action: string | null = null;
                if (attempt?.status === "GRADED") {
                  state = <Badge>Score {attempt.score}/{attempt.maxScore} ({percent(attempt.score, attempt.maxScore)}%)</Badge>;
                  action = "View result";
                } else if (attempt?.status === "SUBMITTED") {
                  state = <Badge variant="gold">Submitted, being marked</Badge>;
                  action = "View";
                } else if (attempt?.status === "IN_PROGRESS") {
                  state = <Badge variant="gold">In progress</Badge>;
                  action = "Continue";
                } else if (ended) {
                  state = <Badge variant="muted">Closed, not taken</Badge>;
                } else if (notYet) {
                  state = <Badge variant="muted">Opens {formatAcademyDateTime(a.opensAt as Date)} (WAT)</Badge>;
                } else {
                  state = <Badge variant="gold">Open</Badge>;
                  action = "Open";
                }

                return (
                  <Card key={a.id}>
                    <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{a.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {KIND_LABEL[a.kind]} · {a.durationMinutes} minutes
                          {a.closesAt ? ` · Closes ${formatAcademyDateTime(a.closesAt)} (WAT)` : ""}
                        </p>
                        <div className="mt-2">{state}</div>
                      </div>
                      {action && (
                        <Button asChild size="sm" variant={action === "Open" || action === "Continue" ? "default" : "outline"}>
                          <Link href={`/dashboard/assessments/${a.id}`}>{action}</Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {e.course.assessments.length === 0 && (
                <p className="text-sm text-muted-foreground">Nothing has been set for this course yet.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
