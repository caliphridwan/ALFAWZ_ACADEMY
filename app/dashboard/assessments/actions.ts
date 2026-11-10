"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { finalizeAttempt, GRACE_SECONDS } from "@/lib/assessment/service";

type Result = { ok: boolean; error?: string; expired?: boolean };

async function requireStudent() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") throw new Error("Unauthorized");
  return session.user.id;
}

function refresh(courseId?: string) {
  revalidatePath("/dashboard/assessments", "layout");
  if (courseId) {
    revalidatePath(`/admin/courses/${courseId}/assessments`, "layout");
    revalidatePath(`/teacher/courses/${courseId}/assessments`, "layout");
  }
}

/** Starts the student's one attempt (or returns the one already in progress). */
export async function startAttempt(assessmentId: string): Promise<Result> {
  const studentId = await requireStudent();

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: {
      id: true,
      courseId: true,
      status: true,
      durationMinutes: true,
      opensAt: true,
      closesAt: true,
      questions: { select: { points: true } },
    },
  });
  if (!assessment || assessment.status !== "PUBLISHED") return { ok: false, error: "This assessment is not open." };

  const enrolled = await prisma.enrollment.findFirst({
    where: { studentId, courseId: assessment.courseId, status: "ACTIVE" },
    select: { id: true },
  });
  if (!enrolled) return { ok: false, error: "You are not enrolled in this course." };

  const existing = await prisma.assessmentAttempt.findUnique({
    where: { assessmentId_studentId: { assessmentId, studentId } },
    select: { id: true, status: true },
  });
  if (existing) {
    return existing.status === "IN_PROGRESS" ? { ok: true } : { ok: false, error: "You have already taken this assessment." };
  }

  const now = new Date();
  if (assessment.opensAt && assessment.opensAt > now) return { ok: false, error: "It has not opened yet." };
  if (assessment.closesAt && assessment.closesAt <= now) return { ok: false, error: "It has closed." };
  if (assessment.questions.length === 0) return { ok: false, error: "This assessment has no questions yet." };

  let deadline = new Date(now.getTime() + assessment.durationMinutes * 60 * 1000);
  if (assessment.closesAt && assessment.closesAt < deadline) deadline = assessment.closesAt;

  try {
    await prisma.assessmentAttempt.create({
      data: {
        assessmentId,
        studentId,
        startedAt: now,
        deadlineAt: deadline,
        maxScore: assessment.questions.reduce((s, q) => s + q.points, 0),
      },
    });
  } catch {
    // Two taps at once: the other request created it, which is fine.
    const again = await prisma.assessmentAttempt.findUnique({
      where: { assessmentId_studentId: { assessmentId, studentId } },
      select: { status: true },
    });
    if (!again) return { ok: false, error: "Could not start. Please try again." };
  }

  refresh(assessment.courseId);
  return { ok: true };
}

async function saveInto(attemptId: string, answers: Record<string, string>) {
  const questionIds = Object.keys(answers);
  if (questionIds.length === 0) return;
  const valid = await prisma.assessmentQuestion.findMany({
    where: { id: { in: questionIds }, assessment: { attempts: { some: { id: attemptId } } } },
    select: { id: true },
  });
  for (const { id } of valid) {
    const response = String(answers[id] ?? "").slice(0, 10000);
    await prisma.assessmentAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId: id } },
      create: { attemptId, questionId: id, response },
      update: { response },
    });
  }
}

async function ownAttempt(attemptId: string, studentId: string) {
  return prisma.assessmentAttempt.findFirst({
    where: { id: attemptId, studentId },
    select: { id: true, status: true, deadlineAt: true, assessment: { select: { courseId: true } } },
  });
}

/** Saves answers while the student writes. Rejected once the time is up. */
export async function saveAnswers(attemptId: string, answers: Record<string, string>): Promise<Result> {
  const studentId = await requireStudent();
  const attempt = await ownAttempt(attemptId, studentId);
  if (!attempt) return { ok: false, error: "Attempt not found." };
  if (attempt.status !== "IN_PROGRESS") return { ok: false, expired: true, error: "Already submitted." };

  if (Date.now() > attempt.deadlineAt.getTime() + GRACE_SECONDS * 1000) {
    await finalizeAttempt(attempt.id);
    refresh(attempt.assessment.courseId);
    return { ok: false, expired: true, error: "Time is up." };
  }
  await saveInto(attempt.id, answers);
  return { ok: true };
}

/** Submits the attempt (also used when the timer reaches zero). */
export async function submitAttempt(attemptId: string, answers: Record<string, string>): Promise<Result> {
  const studentId = await requireStudent();
  const attempt = await ownAttempt(attemptId, studentId);
  if (!attempt) return { ok: false, error: "Attempt not found." };
  if (attempt.status !== "IN_PROGRESS") return { ok: true }; // already done

  // Answers sent after the deadline (plus a short grace for slow networks) are not accepted;
  // whatever was saved earlier is what gets marked.
  if (Date.now() <= attempt.deadlineAt.getTime() + GRACE_SECONDS * 1000) {
    await saveInto(attempt.id, answers);
  }
  await finalizeAttempt(attempt.id);
  refresh(attempt.assessment.courseId);
  return { ok: true };
}
