"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireCourseStaff } from "@/lib/auth/course-access";
import { createNotification } from "@/lib/notifications";
import { parseAcademyDateTime } from "@/lib/utils/datetime";
import { courseResults, finalizeAttempt, finalizeOverdueAttempts, recomputeAttempt } from "@/lib/assessment/service";

export type AssessmentFormState = {
  success: boolean;
  assessmentId?: string;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

type Result = { ok: boolean; error?: string };

function refresh(courseId: string) {
  revalidatePath(`/admin/courses/${courseId}/assessments`, "layout");
  revalidatePath(`/teacher/courses/${courseId}/assessments`, "layout");
  revalidatePath("/dashboard/assessments", "layout");
  revalidatePath("/dashboard", "layout");
}

async function assessmentCourse(assessmentId: string) {
  const a = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { id: true, courseId: true, title: true, status: true, kind: true, course: { select: { title: true } } },
  });
  if (!a) return null;
  await requireCourseStaff(a.courseId); // throws if this is not the teacher's course
  return a;
}

const detailsSchema = z.object({
  title: z.string().trim().min(3, "Give it a title").max(150),
  instructions: z.string().trim().max(4000).optional(),
  kind: z.enum(["QUIZ", "TEST", "EXAM"]),
  durationMinutes: z.coerce.number().int().min(5, "At least 5 minutes").max(360, "At most 360 minutes"),
  opensAt: z.string().optional().transform((v) => parseAcademyDateTime(v)),
  closesAt: z.string().optional().transform((v) => parseAcademyDateTime(v)),
  shuffleQuestions: z.boolean(),
});

function readDetails(formData: FormData) {
  return detailsSchema.safeParse({
    title: formData.get("title") ?? "",
    instructions: formData.get("instructions") || undefined,
    kind: formData.get("kind") ?? "QUIZ",
    durationMinutes: formData.get("durationMinutes") ?? "30",
    opensAt: formData.get("opensAt") || undefined,
    closesAt: formData.get("closesAt") || undefined,
    shuffleQuestions: formData.get("shuffleQuestions") === "on",
  });
}

export async function createAssessment(
  courseId: string,
  _prev: AssessmentFormState,
  formData: FormData
): Promise<AssessmentFormState> {
  await requireCourseStaff(courseId);
  const parsed = readDetails(formData);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const d = parsed.data;
  if (d.opensAt && d.closesAt && d.closesAt <= d.opensAt) {
    return { success: false, fieldErrors: { closesAt: ["Closing time must be after the opening time"] } };
  }

  const created = await prisma.assessment.create({
    data: {
      courseId,
      title: d.title,
      instructions: d.instructions || null,
      kind: d.kind,
      durationMinutes: d.durationMinutes,
      opensAt: d.opensAt,
      closesAt: d.closesAt,
      shuffleQuestions: d.shuffleQuestions,
    },
    select: { id: true },
  });
  refresh(courseId);
  return { success: true, assessmentId: created.id };
}

export async function updateAssessment(
  assessmentId: string,
  _prev: AssessmentFormState,
  formData: FormData
): Promise<AssessmentFormState> {
  const a = await assessmentCourse(assessmentId);
  if (!a) return { success: false, formError: "Assessment not found." };

  const parsed = readDetails(formData);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const d = parsed.data;
  if (d.opensAt && d.closesAt && d.closesAt <= d.opensAt) {
    return { success: false, fieldErrors: { closesAt: ["Closing time must be after the opening time"] } };
  }

  await prisma.assessment.update({
    where: { id: assessmentId },
    data: {
      title: d.title,
      instructions: d.instructions || null,
      kind: d.kind,
      durationMinutes: d.durationMinutes,
      opensAt: d.opensAt,
      closesAt: d.closesAt,
      shuffleQuestions: d.shuffleQuestions,
    },
  });
  refresh(a.courseId);
  return { success: true };
}

export async function setAssessmentStatus(
  assessmentId: string,
  status: "DRAFT" | "PUBLISHED" | "CLOSED"
): Promise<Result> {
  const a = await assessmentCourse(assessmentId);
  if (!a) return { ok: false, error: "Assessment not found." };

  if (status === "PUBLISHED") {
    const count = await prisma.assessmentQuestion.count({ where: { assessmentId } });
    if (count === 0) return { ok: false, error: "Add at least one question before publishing." };
  }
  if (status === "DRAFT") {
    const attempts = await prisma.assessmentAttempt.count({ where: { assessmentId } });
    if (attempts > 0) return { ok: false, error: "Students have already started, so it can't go back to draft. Close it instead." };
  }

  await prisma.assessment.update({ where: { id: assessmentId }, data: { status } });

  if (status === "PUBLISHED" && a.status === "DRAFT") {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: a.courseId, status: "ACTIVE" },
      select: { studentId: true },
    });
    const label = a.kind === "EXAM" ? "exam" : a.kind === "TEST" ? "test" : "quiz";
    for (const { studentId } of enrollments) {
      await createNotification(
        studentId,
        "New assessment available",
        `A new ${label}, "${a.title}", is open in ${a.course.title}. Open Assessments to take it.`
      );
    }
  }

  if (status === "CLOSED") {
    // Anyone still writing is stopped and their answers are marked now.
    const running = await prisma.assessmentAttempt.findMany({
      where: { assessmentId, status: "IN_PROGRESS" },
      select: { id: true },
    });
    for (const r of running) await finalizeAttempt(r.id);
  }

  refresh(a.courseId);
  return { ok: true };
}

export async function deleteAssessment(assessmentId: string): Promise<Result> {
  const a = await assessmentCourse(assessmentId);
  if (!a) return { ok: false, error: "Assessment not found." };
  const attempts = await prisma.assessmentAttempt.count({ where: { assessmentId } });
  if (attempts > 0) return { ok: false, error: "Students have taken this, so it can't be deleted. Close it instead." };
  await prisma.assessment.delete({ where: { id: assessmentId } });
  refresh(a.courseId);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

const questionSchema = z
  .object({
    type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "LONG_ANSWER"]),
    prompt: z.string().trim().min(3, "Write the question").max(2000),
    options: z.array(z.string().trim().max(300)).max(8),
    correct: z.string().trim().max(500),
    points: z.coerce.number().int().min(1, "At least 1 point").max(100),
  })
  .superRefine((q, ctx) => {
    if (q.type === "MULTIPLE_CHOICE") {
      const opts = q.options.filter(Boolean);
      if (opts.length < 2) ctx.addIssue({ code: "custom", path: ["options"], message: "Give at least two choices" });
      const idx = Number(q.correct);
      if (!Number.isInteger(idx) || idx < 0 || idx >= q.options.length || !q.options[idx])
        ctx.addIssue({ code: "custom", path: ["correct"], message: "Choose the correct answer" });
    }
    if (q.type === "TRUE_FALSE" && q.correct !== "true" && q.correct !== "false") {
      ctx.addIssue({ code: "custom", path: ["correct"], message: "Choose true or false" });
    }
  });

export type QuestionInput = {
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "LONG_ANSWER";
  prompt: string;
  options: string[];
  correct: string;
  points: number;
};

export type QuestionResult = { ok: boolean; error?: string; fieldErrors?: Record<string, string[]> };

async function questionsLocked(assessmentId: string) {
  return (await prisma.assessmentAttempt.count({ where: { assessmentId } })) > 0;
}

export async function saveQuestion(
  assessmentId: string,
  questionId: string | null,
  input: QuestionInput
): Promise<QuestionResult> {
  const a = await assessmentCourse(assessmentId);
  if (!a) return { ok: false, error: "Assessment not found." };
  if (await questionsLocked(assessmentId)) {
    return { ok: false, error: "Students have already started, so the questions are locked." };
  }

  const parsed = questionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const q = parsed.data;

  // Keep blank choices out, and re-point "correct" at the cleaned list.
  let options: string[] | null = null;
  let correct: string | null = q.correct || null;
  if (q.type === "MULTIPLE_CHOICE") {
    const correctText = q.options[Number(q.correct)];
    const cleaned = q.options.filter(Boolean);
    options = cleaned;
    correct = String(cleaned.indexOf(correctText));
  } else if (q.type === "TRUE_FALSE") {
    options = null;
  } else if (q.type === "LONG_ANSWER") {
    correct = null;
  }

  const data = {
    type: q.type,
    prompt: q.prompt,
    options: options ?? Prisma.DbNull,
    correct,
    points: q.points,
  };

  if (questionId) {
    const existing = await prisma.assessmentQuestion.findFirst({ where: { id: questionId, assessmentId }, select: { id: true } });
    if (!existing) return { ok: false, error: "Question not found." };
    await prisma.assessmentQuestion.update({ where: { id: questionId }, data });
  } else {
    const last = await prisma.assessmentQuestion.aggregate({ where: { assessmentId }, _max: { position: true } });
    await prisma.assessmentQuestion.create({
      data: { ...data, assessmentId, position: (last._max.position ?? 0) + 1 },
    });
  }

  refresh(a.courseId);
  return { ok: true };
}

export async function deleteQuestion(questionId: string): Promise<Result> {
  const q = await prisma.assessmentQuestion.findUnique({ where: { id: questionId }, select: { assessmentId: true } });
  if (!q) return { ok: false, error: "Question not found." };
  const a = await assessmentCourse(q.assessmentId);
  if (!a) return { ok: false, error: "Assessment not found." };
  if (await questionsLocked(q.assessmentId)) {
    return { ok: false, error: "Students have already started, so the questions are locked." };
  }
  await prisma.assessmentQuestion.delete({ where: { id: questionId } });
  refresh(a.courseId);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Marking
// ---------------------------------------------------------------------------

export type MarkInput = { answerId: string; score: number; feedback: string };

/** Saves a teacher's marks for one student's attempt. */
export async function saveMarks(attemptId: string, marks: MarkInput[]): Promise<Result> {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      studentId: true,
      status: true,
      assessment: { select: { id: true, title: true, courseId: true } },
    },
  });
  if (!attempt) return { ok: false, error: "Attempt not found." };
  await requireCourseStaff(attempt.assessment.courseId);
  if (attempt.status === "IN_PROGRESS") return { ok: false, error: "The student is still writing." };

  const answers = await prisma.assessmentAnswer.findMany({
    where: { attemptId, id: { in: marks.map((m) => m.answerId) } },
    include: { question: { select: { points: true } } },
  });
  const byId = new Map(answers.map((a) => [a.id, a]));

  for (const m of marks) {
    const answer = byId.get(m.answerId);
    if (!answer) return { ok: false, error: "An answer does not belong to this attempt." };
    const score = Math.round(Number(m.score));
    if (!Number.isFinite(score) || score < 0 || score > answer.question.points) {
      return { ok: false, error: `Marks must be between 0 and ${answer.question.points}.` };
    }
  }

  for (const m of marks) {
    await prisma.assessmentAnswer.update({
      where: { id: m.answerId },
      data: { score: Math.round(Number(m.score)), feedback: m.feedback.trim().slice(0, 2000) || null },
    });
  }

  const justGraded = await recomputeAttempt(attemptId);
  if (justGraded) {
    await createNotification(
      attempt.studentId,
      "Assessment result ready",
      `Your result for "${attempt.assessment.title}" has been marked. Open Assessments to see it.`
    );
  }

  refresh(attempt.assessment.courseId);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Grading scheme and final results
// ---------------------------------------------------------------------------

const schemeSchema = z
  .object({
    caWeight: z.coerce.number().int().min(0).max(100),
    examWeight: z.coerce.number().int().min(0).max(100),
    passMark: z.coerce.number().int().min(1, "At least 1").max(100),
  })
  .refine((v) => v.caWeight + v.examWeight === 100, {
    path: ["examWeight"],
    message: "The two weights must add up to 100",
  });

export async function saveGradingScheme(
  courseId: string,
  _prev: AssessmentFormState,
  formData: FormData
): Promise<AssessmentFormState> {
  await requireCourseStaff(courseId);
  const parsed = schemeSchema.safeParse({
    caWeight: formData.get("caWeight"),
    examWeight: formData.get("examWeight"),
    passMark: formData.get("passMark"),
  });
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  await prisma.course.update({ where: { id: courseId }, data: parsed.data });
  refresh(courseId);
  return { success: true };
}

/**
 * Records each student's final result (pass/fail and percentage) on their
 * enrollment, which also shows them the existing result pop-up. Students who
 * still have answers waiting to be marked are skipped and reported.
 */
export async function publishResults(courseId: string): Promise<{ ok: boolean; error?: string; published?: number; skipped?: number }> {
  await requireCourseStaff(courseId);
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { title: true } });
  if (!course) return { ok: false, error: "Course not found." };

  const assessmentIds = (
    await prisma.assessment.findMany({ where: { courseId }, select: { id: true } })
  ).map((a) => a.id);
  for (const id of assessmentIds) await finalizeOverdueAttempts({ assessmentId: id });

  const results = await courseResults(courseId);
  let published = 0;
  let skipped = 0;

  for (const r of results) {
    if (r.final === null || r.pending) {
      skipped += 1;
      continue;
    }
    await prisma.enrollment.update({
      where: { id: r.enrollmentId },
      data: {
        examResult: r.passed ? "PASSED" : "FAILED",
        finalScore: r.final,
        examResultSeen: false,
      },
    });
    await createNotification(
      r.studentId,
      "Your final result is ready",
      `Your result for ${course.title} is available: ${r.final}% (${r.passed ? "Passed" : "Not passed"}). Open Assessments to see how it was worked out.`
    );
    published += 1;
  }

  refresh(courseId);
  revalidatePath("/admin/students", "layout");
  return { ok: true, published, skipped };
}
