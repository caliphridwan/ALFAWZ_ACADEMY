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

export default async function CertificatePage({ params }: { params: { number: string } }) {
  const number = decodeURIComponent(params.number).toUpperCase();
  if (!/^AFZ-\d{4}-[A-Z0-9]{8}$/.test(number)) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { certificateNumber: number },
    include: {
      student: { select: { name: true } },
      course: { select: { title: true, duration: true } },
    },
  });

  if (!enrollment || !enrollment.certificateIssuedAt) notFound();

  return (
    <div className="container py-10">
      {/* Hide the site header/footer/WhatsApp bubble when printing, and fit one landscape page. */}
      <style>{`
        @media print {
          header, footer, nav, a[href*="wa.me"], .no-print { display: none !important; }
          body { background: #fff !important; }
          main { padding: 0 !important; }
          .certificate-frame { box-shadow: none !important; margin: 0 !important; max-width: none !important; }
        }
        @page { size: A4 landscape; margin: 10mm; }
      `}</style>

      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Certificate number <span className="font-mono">{enrollment.certificateNumber}</span> — this page is the
          public verification record.
        </p>
        <PrintButton />
      </div>

      <div className="certificate-frame mx-auto max-w-4xl rounded-lg border-[6px] border-double border-brand bg-white p-3 shadow-lg">
        <div className="rounded border border-amber-500/60 px-6 py-12 text-center sm:px-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand">AlFawz Academy</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-5xl">Certificate of Completion</h1>

          <p className="mt-10 text-sm uppercase tracking-widest text-slate-500">This certifies that</p>
          <p className="mt-3 text-3xl font-semibold text-brand sm:text-4xl">{enrollment.student.name}</p>

          <p className="mt-8 text-slate-600">has successfully completed the course</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{enrollment.course.title}</p>

          <p className="mt-8 text-slate-600">
            Issued on {formatAcademyDate(enrollment.certificateIssuedAt)}
          </p>

          <div className="mt-14 flex items-end justify-between gap-8 text-left text-xs text-slate-500">
            <div>
              <div className="mb-1 h-px w-40 bg-slate-400" />
              Academy Director
            </div>
            <div className="text-right">
              <p className="font-mono text-sm text-slate-700">{enrollment.certificateNumber}</p>
              <p>Verify this certificate at this page&apos;s address</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
