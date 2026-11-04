import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { ensureStudentNumber } from "@/lib/student-number";
import { qrDataUrl } from "@/lib/qr";
import { PrintButton } from "@/components/shared/print-button";
import { Card, CardContent } from "@/components/ui/card";
import { IdCardBack, IdCardFront, type IdCardData } from "@/components/student-id/id-card";

export const dynamic = "force-dynamic";

export default async function IdCardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [user, enrollments, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, profileImage: true, createdAt: true },
    }),
    prisma.enrollment.findMany({
      where: { studentId: userId, status: { in: ["ACTIVE", "COMPLETED"] } },
      include: { course: { select: { title: true } } },
      orderBy: { enrolledAt: "asc" },
    }),
    prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: {
        logoUrl: true,
        contactEmail: true,
        phoneNumber: true,
        directorName: true,
        directorTitle: true,
        directorSignatureUrl: true,
      },
    }),
  ]);

  if (!user) return null;

  if (enrollments.length === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Student ID Card</h1>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Your ID card becomes available once you are enrolled in a course.
          </CardContent>
        </Card>
      </div>
    );
  }

  const studentNumber = await ensureStudentNumber(userId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify/${studentNumber}`;

  // Show a current course first; "+N more" if there are several.
  const current = enrollments.filter((e) => e.status === "ACTIVE");
  const shown = (current.length ? current : enrollments)[0].course.title;
  const extra = (current.length ? current.length : enrollments.length) - 1;

  const data: IdCardData = {
    name: user.name,
    studentNumber,
    photoUrl: user.profileImage || null,
    programme: extra > 0 ? `${shown} +${extra} more` : shown,
    memberSince: user.createdAt.getFullYear(),
    logoUrl: settings?.logoUrl || null,
    verifyUrl,
    qrDataUrl: await qrDataUrl(verifyUrl),
    contactEmail: settings?.contactEmail || null,
    phone: settings?.phoneNumber || null,
    directorName: settings?.directorName || null,
    directorTitle: settings?.directorTitle || "Academy Director",
    signatureUrl: settings?.directorSignatureUrl || null,
  };

  return (
    <div>
      <style>{`
        @media print {
          header, footer, nav, aside, a[href*="wa.me"], .no-print { display: none !important; }
          body { background: #fff !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .id-sheet { display: flex !important; flex-wrap: nowrap !important; gap: 8mm !important; justify-content: center; margin: 10mm 0 0 !important; }
          .id-sheet > div { width: 85.6mm !important; max-width: none !important; }
          .id-card { outline: 0.2mm dashed #9ca3af; outline-offset: 1.2mm; }
        }
        @page { size: A4 portrait; margin: 10mm; }
      `}</style>

      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Student ID Card</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your official AlFawz Academy card. Print it, or save it as a PDF to keep on your phone.
          </p>
        </div>
        <PrintButton label="Print / Save as PDF" />
      </div>

      <div className="id-sheet flex flex-wrap items-start gap-6">
        <div className="w-full max-w-[430px] shadow-lg rounded-[4cqw]">
          <IdCardFront d={data} />
        </div>
        <div className="w-full max-w-[430px] shadow-lg rounded-[4cqw]">
          <IdCardBack d={data} />
        </div>
      </div>

      <p className="no-print mt-6 max-w-xl text-xs text-muted-foreground">
        Tip: set the print option to &quot;Actual size&quot; (scale 100%) and tick &quot;Background graphics&quot; so the
        card prints at standard ID size (85.6 × 54 mm) with its colours. To add your photo, upload one under Profile.
      </p>
    </div>
  );
}
