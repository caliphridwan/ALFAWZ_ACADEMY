import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Sponsors give into one pooled fund and the Academy chooses the students, so
 * sponsors are shown group totals only, never individual students. To keep any
 * one child from being identifiable, averages are withheld until at least
 * MIN_GROUP students are supported, and small groups are shown as
 * "fewer than 3".
 */
export const MIN_GROUP = 3;

export type FundImpact = {
  /** Places paid for by all active sponsorships together. */
  fundedPlaces: number;
  /** Students currently supported by the fund (scholarship enrolments). */
  supported: number;
  completed: number;
  /** Automatic completed count is 1 or 2 and not overridden: shown as "fewer than 3". */
  completedSmall: boolean;
  certificates: number | null;
  byLevel: { level: string; count: number; small: boolean }[];
  /** All of the following are null until enough students are supported. */
  attendancePct: number | null;
  recitationAvg: number | null; // out of 5
  passRatePct: number | null;
  passedCount: number | null;
  assessedCount: number | null;
  /** Enough students that individual figures can be shown safely. */
  detailed: boolean;
};

export async function getAutoFundImpact(): Promise<FundImpact> {
  const [placesAgg, enrollments] = await Promise.all([
    prisma.sponsorship.aggregate({ where: { status: "ACTIVE" }, _sum: { numberOfStudents: true } }),
    prisma.enrollment.findMany({
      where: { source: "SCHOLARSHIP", status: { in: ["ACTIVE", "COMPLETED"] } },
      select: {
        studentId: true,
        status: true,
        examResult: true,
        certificateIssuedAt: true,
        course: { select: { level: true } },
      },
    }),
  ]);

  const studentIds = Array.from(new Set(enrollments.map((e) => e.studentId)));
  const supported = studentIds.length;
  const detailed = supported >= MIN_GROUP;

  const levelCounts = new Map<string, Set<string>>();
  for (const e of enrollments) {
    const set = levelCounts.get(e.course.level) ?? new Set<string>();
    set.add(e.studentId);
    levelCounts.set(e.course.level, set);
  }
  const byLevel = Array.from(levelCounts.entries())
    .map(([level, set]) => ({ level, count: set.size, small: set.size < MIN_GROUP }))
    .sort((a, b) => b.count - a.count);

  let attendancePct: number | null = null;
  let recitationAvg: number | null = null;
  let passRatePct: number | null = null;
  let passedCount: number | null = null;
  let assessedCount: number | null = null;

  if (detailed) {
    const [attendance, ratings] = await Promise.all([
      prisma.attendance.groupBy({
        by: ["status"],
        where: { studentId: { in: studentIds } },
        _count: { _all: true },
      }),
      prisma.recitationSubmission.aggregate({
        where: { studentId: { in: studentIds }, rating: { not: null } },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    // Excused absences are not held against anyone.
    const present = attendance.find((a) => a.status === "PRESENT")?._count._all ?? 0;
    const absent = attendance.find((a) => a.status === "ABSENT")?._count._all ?? 0;
    if (present + absent > 0) attendancePct = Math.round((present / (present + absent)) * 100);

    if (ratings._count.rating >= MIN_GROUP && ratings._avg.rating !== null) {
      recitationAvg = Math.round(ratings._avg.rating * 10) / 10;
    }

    const graded = enrollments.filter((e) => e.examResult !== null);
    if (graded.length >= MIN_GROUP) {
      const passed = graded.filter((e) => e.examResult === "PASSED").length;
      assessedCount = graded.length;
      passedCount = passed;
      passRatePct = Math.round((passed / graded.length) * 100);
    }
  }

  return {
    fundedPlaces: placesAgg._sum.numberOfStudents ?? 0,
    supported,
    completed: enrollments.filter((e) => e.status === "COMPLETED").length,
    completedSmall: false,
    certificates: (() => {
      const n = enrollments.filter((e) => e.certificateIssuedAt !== null).length;
      return n >= MIN_GROUP ? n : null;
    })(),
    byLevel,
    attendancePct,
    recitationAvg,
    passRatePct,
    passedCount,
    assessedCount,
    detailed,
  };
}

export type ImpactOverrides = {
  supportedOverride: number | null;
  completedOverride: number | null;
  certificatesOverride: number | null;
  attendanceOverride: number | null;
  recitationOverride: number | null;
  passRateOverride: number | null;
  note: string | null;
};

export async function getImpactOverrides(): Promise<ImpactOverrides> {
  const row = await prisma.sponsorImpactSettings.findUnique({ where: { id: "singleton" } });
  return {
    supportedOverride: row?.supportedOverride ?? null,
    completedOverride: row?.completedOverride ?? null,
    certificatesOverride: row?.certificatesOverride ?? null,
    attendanceOverride: row?.attendanceOverride ?? null,
    recitationOverride: row?.recitationOverride ?? null,
    passRateOverride: row?.passRateOverride ?? null,
    note: row?.note ?? null,
  };
}

/** What sponsors see: the automatic figures, with the admin's own numbers laid over them. */
export async function getFundImpact(): Promise<FundImpact & { note: string | null }> {
  const [auto, o] = await Promise.all([getAutoFundImpact(), getImpactOverrides()]);
  const pass = o.passRateOverride;
  const completed = o.completedOverride ?? auto.completed;
  return {
    ...auto,
    supported: o.supportedOverride ?? auto.supported,
    completed,
    completedSmall: o.completedOverride === null && completed > 0 && completed < MIN_GROUP,
    certificates: o.certificatesOverride ?? auto.certificates,
    attendancePct: o.attendanceOverride ?? auto.attendancePct,
    recitationAvg: o.recitationOverride ?? auto.recitationAvg,
    passRatePct: pass ?? auto.passRatePct,
    passedCount: pass !== null ? null : auto.passedCount,
    assessedCount: pass !== null ? null : auto.assessedCount,
    detailed: auto.detailed || Object.values(o).some((v) => typeof v === "number"),
    note: o.note,
  };
}
