import "server-only";
import { prisma } from "@/lib/db/prisma";
import { courseResults } from "@/lib/assessment/service";

export type ResultSlipData = {
  studentName: string;
  courseTitle: string;
  courseDuration: string | null;
  caWeight: number;
  examWeight: number;
  passMark: number;
  ca: number | null;
  exam: number | null;
  final: number;
  passed: boolean;
  components: { label: string; kind: "QUIZ" | "TEST" | "EXAM" | "RECITATION"; percent: number | null }[];
  logoUrl: string | null;
  directorName: string | null;
  directorTitle: string;
  directorSignatureUrl: string | null;
};

/**
 * Everything printed on a result slip, or null if this student's result for the
 * course has not been published yet. The official final score and pass/fail are
 * the ones recorded when results were published; the breakdown is read live.
 */
export async function getResultSlip(courseId: string, studentId: string): Promise<ResultSlipData | null> {
  const [enrollment, settings, results] = await Promise.all([
    prisma.enrollment.findFirst({
      where: { courseId, studentId, status: { in: ["ACTIVE", "COMPLETED"] } },
      select: {
        examResult: true,
        finalScore: true,
        student: { select: { name: true } },
        course: { select: { title: true, duration: true, caWeight: true, examWeight: true, passMark: true } },
      },
    }),
    prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { logoUrl: true, directorName: true, directorTitle: true, directorSignatureUrl: true },
    }),
    courseResults(courseId, studentId),
  ]);

  if (!enrollment || enrollment.examResult === null || enrollment.finalScore === null) return null;
  const r = results[0];

  return {
    studentName: enrollment.student.name,
    courseTitle: enrollment.course.title,
    courseDuration: enrollment.course.duration ?? null,
    caWeight: enrollment.course.caWeight,
    examWeight: enrollment.course.examWeight,
    passMark: enrollment.course.passMark,
    ca: r?.ca ?? null,
    exam: r?.exam ?? null,
    final: Math.round(enrollment.finalScore * 10) / 10,
    passed: enrollment.examResult === "PASSED",
    components: (r?.components ?? []).map((c) => ({ label: c.label, kind: c.kind, percent: c.percent })),
    logoUrl: settings?.logoUrl || null,
    directorName: settings?.directorName || null,
    directorTitle: settings?.directorTitle || "Academy Director",
    directorSignatureUrl: settings?.directorSignatureUrl || null,
  };
}
