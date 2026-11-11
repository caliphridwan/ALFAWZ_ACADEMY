import { PrintButton } from "@/components/shared/print-button";
import { gradeLetter } from "@/lib/assessment/grading";
import { formatAcademyDate } from "@/lib/utils/datetime";
import type { ResultSlipData } from "@/lib/assessment/slip";

const NAVY = "#1e3a8a";
const GOLD = "#b8892b";
const ARABIC_FONT = "Amiri, 'Noto Naskh Arabic', 'Geeza Pro', 'Traditional Arabic', 'Times New Roman', serif";
const KIND: Record<string, string> = { QUIZ: "Quiz", TEST: "Test", EXAM: "Final exam", RECITATION: "Recitation (average rating)" };

const fmt = (n: number | null) => (n === null ? "—" : `${n}%`);

/** A one-page A4 statement of results. Used by the student, staff and parent views. */
export function ResultSlip({ data, backHref }: { data: ResultSlipData; backHref?: string }) {
  const caItems = data.components.filter((c) => c.kind !== "EXAM");
  const examItems = data.components.filter((c) => c.kind === "EXAM");
  // About 12 rows fit comfortably at full size; beyond that, shrink a little per row (never below 55%).
  const slipZoom = Math.max(0.55, Math.min(1, 1 - (data.components.length - 12) * 0.035));

  return (
    <div className="container py-8">
      <style>{`
        @media print {
          header, footer, nav, aside, a[href*="wa.me"], .no-print { display: none !important; }
          html, body { height: auto !important; min-height: 0 !important; margin: 0 !important; background: #fff !important; }
          main { padding: 0 !important; }
          .container { padding: 0 !important; max-width: none !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Everything is tightened so the slip always fits one A4 page. The zoom is
             set from the number of rows, so a long list of assessments shrinks to fit. */
          .slip {
            box-shadow: none !important; margin: 0 !important; max-width: none !important;
            padding: 7mm 9mm !important; font-size: 11px !important; line-height: 1.35 !important;
            zoom: var(--slip-zoom, 1);
            break-inside: avoid; page-break-inside: avoid; page-break-after: avoid;
          }
          .slip-logo { height: 40px !important; }
          .slip-name-ar { margin-top: 4px !important; font-size: 26px !important; line-height: 1.3 !important; }
          .slip-name-en { font-size: 20px !important; line-height: 1.2 !important; }
          .slip-title { margin-top: 8px !important; font-size: 13px !important; }
          .slip-sec { margin-top: 12px !important; }
          .slip-sec-lg { margin-top: 18px !important; }
          .slip-table td, .slip-table th { padding-top: 3px !important; padding-bottom: 3px !important; }
          .slip-final { padding: 10px !important; }
          .slip-final-num { font-size: 28px !important; }
          .slip-final-num span { font-size: 18px !important; }
          .slip-final-res { margin-top: 4px !important; font-size: 14px !important; }
          .slip-sign { margin-top: 20px !important; }
          .slip-sigbox { height: 36px !important; }
          .slip-sigimg { max-height: 36px !important; }
        }
        @page { size: A4 portrait; margin: 10mm; }
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

      <div
        className="slip mx-auto max-w-[210mm] bg-white p-8 sm:p-12 text-[#1f2937] shadow-xl"
        style={{ border: `3px double ${NAVY}`, ["--slip-zoom" as string]: slipZoom }}
      >
        <div className="text-center">
          {data.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logoUrl} alt="" className="slip-logo mx-auto h-16 w-auto object-contain" />
          )}
          <p dir="rtl" lang="ar" className="slip-name-ar mt-2 text-3xl font-bold" style={{ color: NAVY, fontFamily: ARABIC_FONT }}>
            أكاديمية الفوز
          </p>
          <p className="slip-name-en text-2xl font-extrabold uppercase tracking-wide" style={{ color: NAVY }}>
            AlFawz Academy
          </p>
          <h1 className="slip-title mt-4 text-lg font-bold tracking-wide" style={{ color: NAVY }}>
            STATEMENT OF RESULTS
          </h1>
          <div className="mx-auto mt-2 h-0.5 w-24" style={{ background: GOLD }} />
        </div>

        <dl className="slip-sec-lg mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
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

        <table className="slip-table slip-sec-lg mt-8 w-full text-sm">
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

        <div className="slip-sec mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded border border-gray-200 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Continuous assessment ({data.caWeight}%)</p>
            <p className="mt-1 text-lg font-semibold">{fmt(data.ca)}</p>
          </div>
          <div className="rounded border border-gray-200 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Exam ({data.examWeight}%)</p>
            <p className="mt-1 text-lg font-semibold">{fmt(data.exam)}</p>
          </div>
        </div>

        <div className="slip-final slip-sec mt-6 rounded-lg p-5 text-center" style={{ background: "#f4f6fb", border: `1px solid ${NAVY}` }}>
          <p className="text-xs uppercase tracking-widest text-gray-500">Final score</p>
          <p className="slip-final-num mt-1 text-4xl font-bold" style={{ color: NAVY }}>
            {data.final}% <span className="text-2xl">({gradeLetter(data.final)})</span>
          </p>
          <p className="slip-final-res mt-2 text-lg font-semibold" style={{ color: data.passed ? "#15803d" : "#6b7280" }}>
            {data.passed ? "PASSED" : "NOT PASSED"}
          </p>
          <p className="mt-1 text-xs text-gray-500">Pass mark {data.passMark}%</p>
        </div>

        <div className="slip-sign mt-12 flex items-end justify-between gap-6 text-sm">
          <p className="max-w-[55%] text-xs text-gray-500">
            Final score = continuous assessment × {data.caWeight}% + exam × {data.examWeight}%. This slip reflects the results published by the
            academy on the date of issue.
          </p>
          <div className="text-center">
            <div className="slip-sigbox flex h-14 items-end justify-center">
              {data.directorSignatureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.directorSignatureUrl} alt="" className="slip-sigimg max-h-14 w-auto object-contain" />
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
