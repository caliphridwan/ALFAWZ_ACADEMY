import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { PrintButton } from "@/components/shared/print-button";
import { formatAcademyDate } from "@/lib/utils/datetime";

export const dynamic = "force-dynamic";

// Certificates are reached by their (hard to guess) number, never listed.
export const metadata: Metadata = {
  title: "Certificate of Completion",
  robots: { index: false, follow: false },
};

const NAVY = "#1e3a8a";
const GOLD = "#b8892b";

/** One corner flourish; rotated into the four corners by the caller. */
function Corner({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={`absolute h-16 w-16 sm:h-24 sm:w-24 ${className}`}>
      <path d="M4 96 V4 H96" fill="none" stroke={GOLD} strokeWidth="3" />
      <path d="M14 96 V14 H96" fill="none" stroke={NAVY} strokeWidth="1" />
      <path d="M4 4 L40 4 L4 40 Z" fill={NAVY} opacity="0.12" />
      <circle cx="22" cy="22" r="6" fill="none" stroke={GOLD} strokeWidth="2" />
      <circle cx="22" cy="22" r="2" fill={GOLD} />
    </svg>
  );
}

/** Gold award seal with ribbon tails. */
function Seal() {
  const rays = Array.from({ length: 24 }, (_, i) => i);
  return (
    <svg viewBox="0 0 120 150" aria-hidden="true" className="h-24 w-20 sm:h-32 sm:w-28">
      <path d="M38 85 L24 142 L44 130 L56 146 L64 92 Z" fill={NAVY} />
      <path d="M82 85 L96 142 L76 130 L64 146 L56 92 Z" fill="#2748b0" />
      <g transform="translate(60 56)">
        {rays.map((i) => (
          <circle key={i} cx={Math.cos((i * Math.PI) / 12) * 46} cy={Math.sin((i * Math.PI) / 12) * 46} r="6" fill={GOLD} />
        ))}
        <circle r="46" fill={GOLD} />
        <circle r="38" fill="#e7c872" stroke="#fff7d6" strokeWidth="2" />
        <circle r="31" fill="none" stroke={GOLD} strokeWidth="1.5" strokeDasharray="2 3" />
        <path
          d="M0 -20 L5.9 -6.2 L20.8 -6.4 L8.9 2.6 L13.5 16.8 L0 8 L-13.5 16.8 L-8.9 2.6 L-20.8 -6.4 L-5.9 -6.2 Z"
          fill={GOLD}
        />
      </g>
    </svg>
  );
}

export default async function CertificatePage({ params }: { params: { number: string } }) {
  const number = decodeURIComponent(params.number).toUpperCase();
  if (!/^AFZ-\d{4}-[A-Z0-9]{8}$/.test(number)) notFound();

  const [enrollment, settings] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { certificateNumber: number },
      include: {
        student: { select: { name: true } },
        course: { select: { title: true, duration: true } },
      },
    }),
    prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { logoUrl: true, directorName: true, directorTitle: true, directorSignatureUrl: true },
    }),
  ]);

  if (!enrollment || !enrollment.certificateIssuedAt) notFound();

  const logoUrl = settings?.logoUrl || null;
  const signatureUrl = settings?.directorSignatureUrl || null;
  const directorName = settings?.directorName || null;
  const directorTitle = settings?.directorTitle || "Academy Director";

  return (
    <div className="container py-10">
      {/* Hide the site header/footer/WhatsApp bubble when printing, and fit one landscape page. */}
      <style>{`
        @media print {
          header, footer, nav, a[href*="wa.me"], .no-print { display: none !important; }
          body { background: #fff !important; }
          main { padding: 0 !important; }
          .container { padding: 0 !important; max-width: none !important; }
          .certificate-frame { box-shadow: none !important; margin: 0 !important; max-width: none !important; width: 100% !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @page { size: A4 landscape; margin: 8mm; }
      `}</style>

      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Certificate number <span className="font-mono">{enrollment.certificateNumber}</span> — this page is the
          public verification record.
        </p>
        <PrintButton />
      </div>

      <div
        className="certificate-frame relative mx-auto max-w-5xl overflow-hidden bg-[#fffdf7] shadow-xl"
        style={{ border: `10px solid ${NAVY}`, outline: `2px solid ${GOLD}`, outlineOffset: "-16px" }}
      >
        {/* Faint watermark crest behind the text */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]"
          style={{ fontSize: "22rem", color: NAVY, lineHeight: 1 }}
        >
          ✦
        </div>

        <Corner className="left-5 top-5" />
        <Corner className="right-5 top-5 rotate-90" />
        <Corner className="bottom-5 right-5 rotate-180" />
        <Corner className="bottom-5 left-5 -rotate-90" />

        <div className="relative px-8 py-12 text-center sm:px-24 sm:py-14">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="AlFawz Academy" className="mx-auto h-16 w-auto object-contain sm:h-20" />
          ) : (
            <p className="text-lg font-bold uppercase tracking-[0.35em]" style={{ color: NAVY }}>
              AlFawz Academy
            </p>
          )}

          <p className="mt-4 font-serif text-lg" style={{ color: GOLD }} dir="rtl" lang="ar">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>

          <h1 className="mt-3 font-serif text-3xl font-bold uppercase tracking-[0.12em] sm:text-5xl" style={{ color: NAVY }}>
            Certificate of Completion
          </h1>
          <div className="mx-auto mt-3 flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-16 sm:w-28" style={{ background: GOLD }} />
            <span style={{ color: GOLD }}>✦</span>
            <span className="h-px w-16 sm:w-28" style={{ background: GOLD }} />
          </div>

          <p className="mt-6 font-serif text-sm italic text-slate-600 sm:text-base">This is proudly presented to</p>
          <p
            className="mx-auto mt-2 max-w-3xl border-b pb-2 font-serif text-4xl italic sm:text-6xl"
            style={{ color: NAVY, borderColor: GOLD }}
          >
            {enrollment.student.name}
          </p>

          <p className="mt-6 font-serif text-sm italic text-slate-600 sm:text-base">
            for successfully completing the course
          </p>
          <p className="mt-2 font-serif text-2xl font-bold text-slate-900 sm:text-4xl">{enrollment.course.title}</p>
          {enrollment.course.duration && (
            <p className="mt-1 text-sm text-slate-500">Course duration: {enrollment.course.duration}</p>
          )}

          <div className="mt-10 grid grid-cols-3 items-end gap-4 text-center">
            {/* Date */}
            <div className="text-xs text-slate-600 sm:text-sm">
              <p className="font-serif text-base text-slate-900 sm:text-lg">
                {formatAcademyDate(enrollment.certificateIssuedAt)}
              </p>
              <div className="mx-auto mt-1 h-px w-32 bg-slate-400 sm:w-44" />
              <p className="mt-1 uppercase tracking-widest">Date of issue</p>
            </div>

            <div className="flex justify-center">
              <Seal />
            </div>

            {/* Director signature */}
            <div className="text-xs text-slate-600 sm:text-sm">
              <div className="flex h-14 items-end justify-center sm:h-16">
                {signatureUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={signatureUrl}
                    alt={directorName ? `Signature of ${directorName}` : "Director's signature"}
                    className="max-h-14 w-auto max-w-full object-contain mix-blend-multiply sm:max-h-16"
                  />
                )}
              </div>
              <div className="mx-auto mt-1 h-px w-32 bg-slate-400 sm:w-44" />
              {directorName && <p className="mt-1 font-serif text-base text-slate-900 sm:text-lg">{directorName}</p>}
              <p className="uppercase tracking-widest">{directorTitle}</p>
            </div>
          </div>

          <div className="mt-8 border-t pt-3 text-[11px] text-slate-500 sm:text-xs" style={{ borderColor: `${GOLD}66` }}>
            Certificate No. <span className="font-mono text-slate-700">{enrollment.certificateNumber}</span> · Verify
            authenticity by opening this certificate&apos;s web address at alfawzacademy.com
          </div>
        </div>
      </div>
    </div>
  );
}
