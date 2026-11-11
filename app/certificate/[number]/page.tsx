import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { PrintButton } from "@/components/shared/print-button";
import { CertificateSheet } from "@/components/certificate/certificate-sheet";
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

  return (
    <div className="container py-10">
      {/* Hide the site header/footer/WhatsApp bubble when printing. The certificate sizes itself
          to the page (everything inside is relative to its own width), and its printed width is capped
          so it always fits one landscape A4 sheet. */}
      <style>{`
        @media print {
          header, footer, nav, a[href*="wa.me"], .no-print { display: none !important; }
          html, body { height: auto !important; min-height: 0 !important; margin: 0 !important; background: #fff !important; overflow: visible !important; }
          main { padding: 0 !important; }
          .container { padding: 0 !important; max-width: none !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* A4 landscape minus 8mm margins is 281 x 194mm; 272mm wide keeps the 297:210 certificate 192mm tall. */
          .certificate-wrap { width: 272mm !important; max-width: 272mm !important; margin: 0 auto !important; }
          .certificate-frame { box-shadow: none !important; }
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

      <div className="certificate-wrap mx-auto max-w-5xl">
        <CertificateSheet
          d={{
            studentName: enrollment.student.name,
            courseTitle: enrollment.course.title,
            courseDuration: enrollment.course.duration || null,
            issuedOn: formatAcademyDate(enrollment.certificateIssuedAt),
            certificateNumber: enrollment.certificateNumber!,
            logoUrl: settings?.logoUrl || null,
            directorName: settings?.directorName || null,
            directorTitle: settings?.directorTitle || "Academy Director",
            signatureUrl: settings?.directorSignatureUrl || null,
          }}
        />
      </div>
    </div>
  );
}
