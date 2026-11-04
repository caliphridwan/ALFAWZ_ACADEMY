import type { CourseProgress } from "@/lib/progress";

/** Server-safe (no hooks): used on the dashboard and the public parent page. */
export function ProgressSummary({ progress }: { progress: CourseProgress }) {
  if (progress.total === 0) return null;

  const heldPercent = Math.round((progress.held / progress.total) * 100);

  return (
    <div className="mt-3 space-y-2 text-xs text-muted-foreground max-w-sm">
      <div>
        <div className="flex justify-between mb-1">
          <span>Classes held</span>
          <span>
            {progress.held} of {progress.total}
          </span>
        </div>
        <div
          className="h-2 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={heldPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Classes held so far"
        >
          <div className="h-full bg-brand" style={{ width: `${heldPercent}%` }} />
        </div>
      </div>

      {progress.attendancePercent !== null && (
        <p>
          Attendance: <span className="font-semibold text-foreground">{progress.attendancePercent}%</span>{" "}
          ({progress.present} attended
          {progress.absent > 0 && `, ${progress.absent} missed`}
          {progress.excused > 0 && `, ${progress.excused} excused`})
        </p>
      )}
    </div>
  );
}
