export type AttendanceValue = "PRESENT" | "ABSENT" | "EXCUSED";

export type ProgressSession = {
  id: string;
  startsAt: Date;
  durationMinutes: number;
  cancelled: boolean;
};

export type CourseProgress = {
  /** Non-cancelled classes scheduled from the student's enrollment onward. */
  total: number;
  /** Of those, how many have already finished. */
  held: number;
  present: number;
  absent: number;
  excused: number;
  /** present / (present + absent), or null until any attendance is marked. */
  attendancePercent: number | null;
};

/**
 * Pure function (safe to import anywhere). Two separate ideas, kept apart on
 * purpose: how far through the scheduled classes the course is (held/total),
 * and how well this student attended the ones that were marked. Classes the
 * teacher hasn't marked yet and excused absences never count against the
 * student's percentage.
 */
export function computeProgress(
  sessions: ProgressSession[],
  attendance: Map<string, AttendanceValue>,
  enrolledAt: Date,
  now: number = Date.now()
): CourseProgress {
  const relevant = sessions.filter((s) => !s.cancelled && s.startsAt.getTime() >= enrolledAt.getTime());

  const heldSessions = relevant.filter((s) => s.startsAt.getTime() + s.durationMinutes * 60000 <= now);

  let present = 0;
  let absent = 0;
  let excused = 0;
  for (const s of heldSessions) {
    const status = attendance.get(s.id);
    if (status === "PRESENT") present += 1;
    else if (status === "ABSENT") absent += 1;
    else if (status === "EXCUSED") excused += 1;
  }

  const marked = present + absent;

  return {
    total: relevant.length,
    held: heldSessions.length,
    present,
    absent,
    excused,
    attendancePercent: marked > 0 ? Math.round((present / marked) * 100) : null,
  };
}
