import { PrintButton } from "@/components/shared/print-button";
import { gradeLetter } from "@/lib/assessment/grading";
import { formatAcademyDate } from "@/lib/utils/datetime";
import type { ResultSlipData } from "@/lib/assessment/slip";

const NAVY = "#1e3a8a";
const GOLD = "#b8892b";
const KIND: Record<string, string> = { QUIZ: "Quiz", TEST: "Test", EXAM: "Final exam", RECITATION: "Recitation (average rating)" };

const fmt = (n: number | null) => (n === null ? "—" : `${n}%`);

/** A one-page A4 statement of results. Used by the student, staff and parent views. */
export function ResultSlip({ data, backHref }: { data: ResultSlipData; backHref?: string }) {
  const caItems = data.components.filter((c) => c.kind !== "EXAM");
  const examItems = data.components.filter((c) => c.kind === "EXAM");

  return (
    <div className="container py-8">
      <style>{`
        @media print {
          header, footer, nav, aside, a[href*="wa.me"], .no-print { display: none !important; }
          body { background: #fff !important; }
          main { padding: 0 !important; }
          .container { padding: 0 !important; max-width: none !important; }
          .slip { box-shadow: none !important; border: 0 !important; margin: 0 !important; max-width: none !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @page { size: A4 portrait; margin: 14mm; }
      `}</style>

      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        {backHref ? (
          <a href={backHref} className="text-sm text-muted-foreground hover:underline">
            ← Back
          </a>
        ) : (
          <span />
        )}
        <PrintButton label="Print / Save as PDF" />
      </div>

      <div className="slip mx-auto max-w-[210mm] bg-white p-8 sm:p-12 text-[#1f2937] shadow-xl" style={{ border: `3px double ${NAVY}` }}>
        <div className="text-center">
          {data.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logoUrl} alt="AlFawz Academy" className="mx-auto h-16 w-auto object-contain" />
          ) : (
            <p className="text-xl font-bold" style={{ color: NAVY }}>
              AlFawz Academy
            </p>
          )}
          <h1 className="mt-3 text-2xl font-bold tracking-wide" style={{ color: NAVY }}>
            STATEMENT OF RESULTS
          </h1>
          <div className="mx-auto mt-2 h-0.5 w-24" style={{ background: GOLD }} />
        </div>

        <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-gray-500">Student</dt>
          <dd className="font-semibold">{data.studentName}</dd>
          <dt className="text-gray-500">Course</dt>
          <dd className="font-semibold">
            {data.courseTitle}
            {data.courseDuration ? <span className="font-normal text-gray-500"> · {data.courseDuration}</span> : null}
          </dd>
          <dt className="text-gray-500">Issued</dt>
          <dd>{formatAcademyDate(new Date())}</dd>
        </dl>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b-2 text-left text-xs uppercase tracking-wide text-gray-500" style={{ borderColor: NAVY }}>
              <th className="py-2">Component</th>
              <th className="py-2">Type</th>
              <th className="py-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {[...caItems, ...examItems].map((c, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-2">{c.label}</td>
                <td className="py-2 text-gray-500">{KIND[c.kind]}</td>
                <td className="py-2 text-right">{fmt(c.percent)}</td>
              </tr>
            ))}
            {data.components.length === 0 && (
              <tr>
                <td colSpan={3} className="py-3 text-gray-500">
                  No individual scores recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded border border-gray-200 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Continuous assessment ({data.caWeight}%)</p>
            <p className="mt-1 text-lg font-semibold">{fmt(data.ca)}</p>
          </div>
          <div className="rounded border border-gray-200 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Exam ({data.examWeight}%)</p>
            <p className="mt-1 text-lg font-semibold">{fmt(data.exam)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg p-5 text-center" style={{ background: "#f4f6fb", border: `1px solid ${NAVY}` }}>
          <p className="text-xs uppercase tracking-widest text-gray-500">Final score</p>
          <p className="mt-1 text-4xl font-bold" style={{ color: NAVY }}>
            {data.final}% <span className="text-2xl">({gradeLetter(data.final)})</span>
          </p>
          <p className="mt-2 text-lg font-semibold" style={{ color: data.passed ? "#15803d" : "#6b7280" }}>
            {data.passed ? "PASSED" : "NOT PASSED"}
          </p>
          <p className="mt-1 text-xs text-gray-500">Pass mark {data.passMark}%</p>
        </div>

        <div className="mt-12 flex items-end justify-between gap-6 text-sm">
          <p className="max-w-[55%] text-xs text-gray-500">
            Final score = continuous assessment × {data.caWeight}% + exam × {data.examWeight}%. This slip reflects the results published by the
            academy on the date of issue.
          </p>
          <div className="text-center">
            <div className="flex h-14 items-end justify-center">
              {data.directorSignatureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.directorSignatureUrl} alt="" className="max-h-14 w-auto object-contain" />
              ) : null}
            </div>
            <div className="mt-1 w-48 border-t border-gray-400 pt-1">
              {data.directorName && <p className="font-semibold">{data.directorName}</p>}
              <p className="text-xs text-gray-500">{data.directorTitle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
