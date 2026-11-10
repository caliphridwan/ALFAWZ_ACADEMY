import "server-only";
import { prisma } from "@/lib/db/prisma";
import { autoMark, finalResult, mean, percent } from "@/lib/assessment/grading";

/** Extra seconds after the deadline during which a late save is still accepted (slow networks). */
export const GRACE_SECONDS = 30;

/**
 * Closes an attempt: marks everything that can be marked automatically, and
 * leaves the rest waiting for a teacher. Safe to call twice (a second call
 * does nothing). Called when a student submits, and lazily when an attempt is
 * found past its deadline, so the timer is enforced on the server.
 */
export async function finalizeAttempt(attemptId: string): Promise<void> {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: true,
      assessment: { include: { questions: true } },
    },
  });
  if (!attempt || attempt.status !== "IN_PROGRESS") return;

  const byQuestion = new Map(attempt.answers.map((a) => [a.questionId, a]));
  let score = 0;
  let max = 0;
  let needsMarking = false;

  for (const q of attempt.assessment.questions) {
    max += q.points;
    const existing = byQuestion.get(q.id);
    const response = existing?.response ?? null;
    const blank = (response ?? "").trim() === "";
    // A blank answer is simply 0; no teacher time needed for it.
    const mark = blank ? 0 : autoMark(q, response);

    if (mark === null) needsMarking = true;
    else score += mark;

    if (existing) {
      await prisma.assessmentAnswer.update({ where: { id: existing.id }, data: { score: mark } });
    } else {
      await prisma.assessmentAnswer.create({
        data: { attemptId: attempt.id, questionId: q.id, response: null, score: mark },
      });
    }
  }

  const now = new Date();
  await prisma.assessmentAttempt.update({
    where: { id: attempt.id },
    data: {
      status: needsMarking ? "SUBMITTED" : "GRADED",
      submittedAt: now,
      gradedAt: needsMarking ? null : now,
      score,
      maxScore: max,
      needsMarking,
    },
  });
}

/** Finalises every attempt of an assessment (or of one student) that ran past its deadline. */
export async function finalizeOverdueAttempts(filter: { assessmentId?: string; studentId?: string }): Promise<void> {
  const cutoff = new Date(Date.now() - GRACE_SECONDS * 1000);
  const overdue = await prisma.assessmentAttempt.findMany({
    where: { ...filter, status: "IN_PROGRESS", deadlineAt: { lt: cutoff } },
    select: { id: true },
  });
  for (const a of overdue) await finalizeAttempt(a.id);
}

/** Same, for every assessment in a course (used by the staff pages so counts are up to date). */
export async function finalizeOverdueForCourse(courseId: string): Promise<void> {
  const cutoff = new Date(Date.now() - GRACE_SECONDS * 1000);
  const overdue = await prisma.assessmentAttempt.findMany({
    where: { status: "IN_PROGRESS", deadlineAt: { lt: cutoff }, assessment: { courseId } },
    select: { id: true },
  });
  for (const a of overdue) await finalizeAttempt(a.id);
}

/** Recalculates an attempt's score from its answers after a teacher marks. Returns true if it just became fully graded. */
export async function recomputeAttempt(attemptId: string): Promise<boolean> {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: { answers: true, assessment: { include: { questions: { select: { id: true, points: true } } } } },
  });
  if (!attempt || attempt.status === "IN_PROGRESS") return false;

  const marks = new Map(attempt.answers.map((a) => [a.questionId, a.score]));
  let score = 0;
  let max = 0;
  let needsMarking = false;
  for (const q of attempt.assessment.questions) {
    max += q.points;
    const m = marks.get(q.id);
    if (m === null || m === undefined) needsMarking = true;
    else score += m;
  }

  const justGraded = attempt.status !== "GRADED" && !needsMarking;
  await prisma.assessmentAttempt.update({
    where: { id: attempt.id },
    data: {
      score,
      maxScore: max,
      needsMarking,
      status: needsMarking ? "SUBMITTED" : "GRADED",
      gradedAt: needsMarking ? null : attempt.gradedAt ?? new Date(),
    },
  });
  return justGraded;
}

export type ResultComponent = {
  label: string;
  kind: "QUIZ" | "TEST" | "EXAM" | "RECITATION";
  /** null = not counted (yet), e.g. still open and not taken. */
  percent: number | null;
  /** The attempt is submitted but still waiting for a teacher's marks. */
  pending: boolean;
};

export type StudentResult = {
  enrollmentId: string;
  studentId: string;
  name: string;
  email: string;
  ca: number | null;
  exam: number | null;
  final: number | null;
  passed: boolean | null;
  partial: boolean;
  /** Some marks are still outstanding, so the figures may change. */
  pending: boolean;
  published: boolean;
  components: ResultComponent[];
};

/**
 * Continuous assessment (every published QUIZ/TEST, plus the average recitation
 * rating) and exam percentages, and the weighted final, for each student in a
 * course (or just one student).
 *
 * A quiz/test a student never opened counts as 0 once it has closed, and is
 * left out while it is still open.
 */
export async function courseResults(courseId: string, onlyStudentId?: string): Promise<StudentResult[]> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { caWeight: true, examWeight: true, passMark: true },
  });
  if (!course) return [];

  const assessments = await prisma.assessment.findMany({
    where: { courseId, status: { in: ["PUBLISHED", "CLOSED"] } },
    select: {
      id: true,
      title: true,
      kind: true,
      status: true,
      closesAt: true,
      questions: { select: { points: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseId,
      status: { in: ["ACTIVE", "COMPLETED"] },
      ...(onlyStudentId ? { studentId: onlyStudentId } : {}),
    },
    select: {
      id: true,
      examResult: true,
      finalScore: true,
      student: { select: { id: true, name: true, email: true } },
    },
    orderBy: { student: { name: "asc" } },
  });

  const attempts = assessments.length
    ? await prisma.assessmentAttempt.findMany({
        where: {
          assessmentId: { in: assessments.map((a) => a.id) },
          ...(onlyStudentId ? { studentId: onlyStudentId } : {}),
        },
        select: { assessmentId: true, studentId: true, status: true, score: true, maxScore: true },
      })
    : [];
  const attemptKey = new Map(attempts.map((a) => [`${a.assessmentId}:${a.studentId}`, a]));

  const ratings = await prisma.recitationSubmission.findMany({
    where: {
      task: { courseId },
      rating: { not: null },
      ...(onlyStudentId ? { studentId: onlyStudentId } : {}),
    },
    select: { studentId: true, rating: true },
  });
  const ratingsByStudent = new Map<string, number[]>();
  for (const r of ratings) {
    if (r.rating === null) continue;
    const list = ratingsByStudent.get(r.studentId) ?? [];
    list.push(r.rating);
    ratingsByStudent.set(r.studentId, list);
  }

  const now = Date.now();
  const results: StudentResult[] = [];

  for (const e of enrollments) {
    const components: ResultComponent[] = [];
    let pending = false;

    for (const a of assessments) {
      const attempt = attemptKey.get(`${a.id}:${e.student.id}`);
      const totalPoints = a.questions.reduce((s, q) => s + q.points, 0);
      const ended = a.status === "CLOSED" || (a.closesAt !== null && a.closesAt.getTime() < now);

      let pct: number | null = null;
      let isPending = false;

      if (attempt && attempt.status === "GRADED") {
        pct = percent(attempt.score, attempt.maxScore || totalPoints);
      } else if (attempt) {
        // Taking it, or submitted and waiting for marks.
        isPending = true;
      } else if (ended) {
        pct = 0; // never took it
      }

      if (isPending) pending = true;
      components.push({ label: a.title, kind: a.kind, percent: pct, pending: isPending });
    }

    const rs = ratingsByStudent.get(e.student.id);
    if (rs && rs.length > 0) {
      const avg = (mean(rs) as number) / 5;
      components.push({ label: "Recitation", kind: "RECITATION", percent: Math.round(avg * 1000) / 10, pending: false });
    }

    const caValues = components
      .filter((c) => c.kind !== "EXAM" && c.percent !== null)
      .map((c) => c.percent as number);
    const examValues = components
      .filter((c) => c.kind === "EXAM" && c.percent !== null)
      .map((c) => c.percent as number);

    const ca = mean(caValues);
    const exam = mean(examValues);
    const fr = finalResult({
      ca: ca === null ? null : Math.round(ca * 10) / 10,
      exam: exam === null ? null : Math.round(exam * 10) / 10,
      caWeight: course.caWeight,
      examWeight: course.examWeight,
      passMark: course.passMark,
    });

    results.push({
      enrollmentId: e.id,
      studentId: e.student.id,
      name: e.student.name,
      email: e.student.email,
      ca: ca === null ? null : Math.round(ca * 10) / 10,
      exam: exam === null ? null : Math.round(exam * 10) / 10,
      final: fr.final,
      passed: fr.passed,
      partial: fr.partial,
      pending,
      published: e.examResult !== null,
      components,
    });
  }

  return results;
}
