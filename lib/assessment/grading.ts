// Pure grading rules (no database), so they are easy to test and reuse.

export type QuestionLike = {
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "LONG_ANSWER";
  correct: string | null;
  points: number;
};

/** Normalise for comparing a typed answer with an accepted one. */
function norm(s: string): string {
  return s.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Marks one answer automatically. Returns the points earned, or null when a
 * teacher has to mark it (long answers, and short answers with no accepted
 * answers listed). An unanswered question scores 0 for auto-marked types.
 */
export function autoMark(q: QuestionLike, response: string | null | undefined): number | null {
  const r = (response ?? "").trim();
  switch (q.type) {
    case "MULTIPLE_CHOICE":
    case "TRUE_FALSE":
      return r !== "" && q.correct !== null && r === q.correct ? q.points : 0;
    case "SHORT_ANSWER": {
      const accepted = (q.correct ?? "")
        .split("|")
        .map(norm)
        .filter(Boolean);
      if (accepted.length === 0) return null; // marked by hand
      return r !== "" && accepted.includes(norm(r)) ? q.points : 0;
    }
    case "LONG_ANSWER":
    default:
      return null;
  }
}

/** True when a teacher has to mark this question by hand. */
export function isManualQuestion(q: Pick<QuestionLike, "type" | "correct">): boolean {
  if (q.type === "LONG_ANSWER") return true;
  if (q.type === "SHORT_ANSWER") return !(q.correct ?? "").split("|").some((s) => s.trim() !== "");
  return false;
}

export function percent(score: number, max: number): number {
  if (max <= 0) return 0;
  return Math.round((score / max) * 1000) / 10; // one decimal place
}

export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export type FinalInput = {
  /** Continuous-assessment percentage (0-100), or null if nothing counts yet. */
  ca: number | null;
  /** Exam percentage (0-100), or null if the exam has not been taken/marked. */
  exam: number | null;
  caWeight: number;
  examWeight: number;
  passMark: number;
};

export type FinalResult = {
  final: number | null;
  passed: boolean | null;
  /** True when only one of CA / exam was available, so the other had to be left out. */
  partial: boolean;
};

/**
 * Final = (CA x caWeight + exam x examWeight) / (caWeight + examWeight).
 * If only one part exists, the final is that part alone (flagged as partial).
 */
export function finalResult(i: FinalInput): FinalResult {
  const { ca, exam } = i;
  if (ca === null && exam === null) return { final: null, passed: null, partial: false };

  let final: number;
  let partial = false;
  if (ca !== null && exam !== null) {
    const total = i.caWeight + i.examWeight;
    final = total > 0 ? (ca * i.caWeight + exam * i.examWeight) / total : (ca + exam) / 2;
  } else {
    final = (ca ?? exam) as number;
    partial = true;
  }
  final = Math.round(final * 10) / 10;
  return { final, passed: final >= i.passMark, partial };
}

export function gradeLetter(pct: number): string {
  if (pct >= 70) return "A";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 45) return "D";
  if (pct >= 40) return "E";
  return "F";
}
