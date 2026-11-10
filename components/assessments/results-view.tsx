import { courseResults, finalizeOverdueForCourse } from "@/lib/assessment/service";
import { gradeLetter } from "@/lib/assessment/grading";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { PublishResultsButton } from "@/components/assessments/publish-results-button";

const fmt = (n: number | null) => (n === null ? "—" : `${n}%`);

/** Shared by the admin and teacher pages: CA, exam and final for every student. */
export async function ResultsView({ courseId }: { courseId: string }) {
  await finalizeOverdueForCourse(courseId);
  const [course, results] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId }, select: { caWeight: true, examWeight: true, passMark: true } }),
    courseResults(courseId),
  ]);
  if (!course) return null;

  return (
    <div className="max-w-4xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Final = continuous assessment × {course.caWeight}% + exam × {course.examWeight}%. Pass mark {course.passMark}%. A quiz or test a student
        never opened counts as 0 once it has closed. If only one part exists yet, the final uses that part alone.
      </p>

      <PublishResultsButton courseId={courseId} />

      {results.length === 0 ? (
        <p className="text-sm text-muted-foreground">No enrolled students yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">CA</th>
                <th className="px-4 py-3">Exam</th>
                <th className="px-4 py-3">Final</th>
                <th className="px-4 py-3">Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.enrollmentId} className="border-t border-border align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.name}</p>
                    <details className="mt-1 text-xs text-muted-foreground">
                      <summary className="cursor-pointer">Breakdown</summary>
                      <ul className="mt-1 space-y-0.5">
                        {r.components.length === 0 && <li>Nothing counted yet</li>}
                        {r.components.map((c, i) => (
                          <li key={i}>
                            {c.label}: {c.pending ? "waiting for marks" : fmt(c.percent)}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </td>
                  <td className="px-4 py-3">{fmt(r.ca)}</td>
                  <td className="px-4 py-3">{fmt(r.exam)}</td>
                  <td className="px-4 py-3">
                    {r.final === null ? "—" : `${r.final}% (${gradeLetter(r.final)})`}
                    {r.partial && r.final !== null && <span className="ml-1 text-xs text-muted-foreground">partial</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.pending ? (
                        <Badge variant="gold">Marks outstanding</Badge>
                      ) : r.passed === null ? (
                        <Badge variant="muted">Nothing to grade</Badge>
                      ) : r.passed ? (
                        <Badge>Pass</Badge>
                      ) : (
                        <Badge variant="muted">Not passed</Badge>
                      )}
                      {r.published && <Badge variant="muted">Published</Badge>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
