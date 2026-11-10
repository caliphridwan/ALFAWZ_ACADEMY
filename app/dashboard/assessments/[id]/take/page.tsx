import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { TakeAssessment, type TakeQuestion } from "@/components/assessments/take-assessment";
import { finalizeAttempt, GRACE_SECONDS } from "@/lib/assessment/service";
import { seededShuffle } from "@/lib/assessment/shuffle";

export const dynamic = "force-dynamic";

export default async function TakeAssessmentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const studentId = session!.user.id;

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { assessmentId_studentId: { assessmentId: params.id, studentId } },
    include: {
      answers: { select: { questionId: true, response: true } },
      assessment: {
        include: {
          // Note: `correct` is deliberately left out of what the browser gets.
          questions: { orderBy: { position: "asc" }, select: { id: true, type: true, prompt: true, options: true, points: true } },
        },
      },
    },
  });
  if (!attempt) notFound();

  const back = `/dashboard/assessments/${params.id}`;
  if (attempt.status !== "IN_PROGRESS") redirect(back);

  const nowMs = Date.now();
  if (nowMs > attempt.deadlineAt.getTime() + GRACE_SECONDS * 1000) {
    await finalizeAttempt(attempt.id);
    redirect(back);
  }
  const remainingMs = Math.max(0, attempt.deadlineAt.getTime() - nowMs);

  const { assessment } = attempt;
  const ordered = assessment.shuffleQuestions ? seededShuffle(assessment.questions, attempt.id) : assessment.questions;

  const questions: TakeQuestion[] = ordered.map((q) => {
    const texts = Array.isArray(q.options) ? (q.options as unknown[]).map(String) : [];
    let options = texts.map((text, index) => ({ index, text }));
    if (assessment.shuffleQuestions && q.type === "MULTIPLE_CHOICE") options = seededShuffle(options, `${attempt.id}:${q.id}`);
    return { id: q.id, type: q.type, prompt: q.prompt, points: q.points, options };
  });

  const initialAnswers: Record<string, string> = {};
  for (const a of attempt.answers) if (a.response !== null) initialAnswers[a.questionId] = a.response;

  return (
    <TakeAssessment
      assessmentId={params.id}
      attemptId={attempt.id}
      title={assessment.title}
      questions={questions}
      initialAnswers={initialAnswers}
      remainingMs={remainingMs}
    />
  );
}
