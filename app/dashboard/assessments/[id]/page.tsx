import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StartButton } from "@/components/assessments/start-button";
import { finalizeOverdueAttempts } from "@/lib/assessment/service";
import { percent } from "@/lib/assessment/grading";
import { formatAcademyDateTime } from "@/lib/utils/datetime";

export const dynamic = "force-dynamic";

export default async function StudentAssessmentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const studentId = session!.user.id;

  await finalizeOverdueAttempts({ studentId, assessmentId: params.id });

  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
    include: {
      course: { select: { id: true, title: true } },
      questions: { orderBy: { position: "asc" } },
      attempts: { where: { studentId }, include: { answers: true } },
    },
  });
  if (!assessment || assessment.status === "DRAFT") notFound();

  const enrolled = await prisma.enrollment.findFirst({
    where: { studentId, courseId: assessment.courseId, status: { in: ["ACTIVE", "COMPLETED"] } },
    select: { id: true },
  });
  if (!enrolled) notFound();

  const attempt = assessment.attempts[0];
  const now = Date.now();
  const ended = assessment.status === "CLOSED" || (assessment.closesAt !== null && assessment.closesAt.getTime() <= now);
  const notYet = assessment.opensAt !== null && assessment.opensAt.getTime() > now;
  const kind = assessment.kind === "EXAM" ? "exam" : assessment.kind === "TEST" ? "test" : "quiz";
  const totalPoints = assessment.questions.reduce((s, q) => s + q.points, 0);

  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/assessments" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> All assessments
      </Link>
      <h1 className="text-2xl font-bold">{assessment.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{assessment.course.title}</p>

      {/* Not started */}
      {!attempt && (
        <Card className="mt-6">
          <CardContent className="space-y-4 p-6">
            <ul className="space-y-1 text-sm">
              <li>
                <strong>{assessment.questions.length}</strong> {assessment.questions.length === 1 ? "question" : "questions"}, {totalPoints} {totalPoints === 1 ? "point" : "points"}
              </li>
              <li>
                Time allowed: <strong>{assessment.durationMinutes} minutes</strong>. The timer starts when you press Start and cannot be paused.
              </li>
              <li>You have <strong>one attempt</strong>. Answers save automatically and are submitted when the time ends.</li>
              {assessment.closesAt && <li>Closes {formatAcademyDateTime(assessment.closesAt)} (WAT)</li>}
            </ul>
            {assessment.instructions && <p className="whitespace-pre-line rounded-md bg-muted/50 p-4 text-sm">{assessment.instructions}</p>}
            {ended ? (
              <p className="text-sm text-muted-foreground">This {kind} has closed.</p>
            ) : notYet ? (
              <p className="text-sm text-muted-foreground">It opens {formatAcademyDateTime(assessment.opensAt as Date)} (WAT).</p>
            ) : enrolled && assessment.status === "PUBLISHED" ? (
              <StartButton assessmentId={assessment.id} label="Start" minutes={assessment.durationMinutes} />
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Running */}
      {attempt?.status === "IN_PROGRESS" && (
        <Card className="mt-6">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm">You have started this {kind}. Your time is running, so continue now.</p>
            <StartButton assessmentId={assessment.id} label="Continue" minutes={assessment.durationMinutes} />
          </CardContent>
        </Card>
      )}

      {/* Submitted or marked */}
      {attempt && attempt.status !== "IN_PROGRESS" && (
        <div className="mt-6 space-y-6">
          <Card className="border-brand/40">
            <CardContent className="p-6">
              {attempt.status === "GRADED" ? (
                <>
                  <p className="text-sm text-muted-foreground">Your score</p>
                  <p className="mt-1 text-3xl font-bold">
                    {attempt.score} / {attempt.maxScore} <span className="text-lg text-muted-foreground">({percent(attempt.score, attempt.maxScore)}%)</span>
                  </p>
                </>
              ) : (
                <>
                  <Badge variant="gold">Submitted</Badge>
                  <p className="mt-3 text-sm">
                    Your answers are in. Some are marked by your teacher, so your score will appear here once that is done. We will notify you.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {attempt.status === "GRADED" && (
            <div className="space-y-4">
              <h2 className="font-semibold">Your answers</h2>
              {assessment.questions.map((q, i) => {
                const a = attempt.answers.find((x) => x.questionId === q.id);
                const options = Array.isArray(q.options) ? (q.options as unknown[]).map(String) : [];
                let shown = a?.response ?? "";
                if (q.type === "MULTIPLE_CHOICE" && shown !== "") shown = options[Number(shown)] ?? shown;
                if (q.type === "TRUE_FALSE" && shown !== "") shown = shown === "true" ? "True" : "False";
                // Right answers are only revealed once nobody can still take it.
                let correct: string | null = null;
                if (ended) {
                  if (q.type === "MULTIPLE_CHOICE") correct = options[Number(q.correct)] ?? null;
                  else if (q.type === "TRUE_FALSE") correct = q.correct === "true" ? "True" : "False";
                  else if (q.type === "SHORT_ANSWER" && q.correct)
                    correct = q.correct.split("|").map((s) => s.trim()).filter(Boolean).join(", ");
                }
                return (
                  <Card key={q.id}>
                    <CardContent className="space-y-2 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-xs text-muted-foreground">Question {i + 1}</p>
                        <Badge variant={a?.score === q.points ? "default" : "muted"}>
                          {a?.score ?? 0} / {q.points}
                        </Badge>
                      </div>
                      <p className="whitespace-pre-line font-medium">{q.prompt}</p>
                      <p className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-line">
                        {shown.trim() ? shown : <span className="text-muted-foreground">No answer given</span>}
                      </p>
                      {correct && <p className="text-xs text-muted-foreground">Correct answer: {correct}</p>}
                      {a?.feedback && <p className="text-sm text-brand">Teacher&apos;s comment: {a.feedback}</p>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
