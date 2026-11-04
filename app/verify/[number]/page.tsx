import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { STUDENT_NUMBER_PATTERN } from "@/lib/student-number";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verify student ID",
  robots: { index: false, follow: false },
};

// Opened by scanning the QR code on a student ID card. Deliberately shows
// very little: a name and whether the student is currently enrolled.
export default async function VerifyStudentPage({ params }: { params: { number: string } }) {
  const number = decodeURIComponent(params.number).toUpperCase();
  const valid = STUDENT_NUMBER_PATTERN.test(number);

  const student = valid
    ? await prisma.user.findUnique({
        where: { studentNumber: number },
        select: {
          name: true,
          isActive: true,
          enrollments: { where: { status: "ACTIVE" }, select: { id: true }, take: 1 },
        },
      })
    : null;

  const enrolled = !!student && student.isActive && student.enrollments.length > 0;

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        {student ? (
          <>
            {enrolled ? (
              <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" aria-hidden="true" />
            ) : (
              <XCircle className="mx-auto h-14 w-14 text-amber-500" aria-hidden="true" />
            )}
            <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              AlFawz Academy student
            </p>
            <h1 className="mt-2 text-2xl font-bold">{student.name}</h1>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{number}</p>
            <p className={`mt-5 font-medium ${enrolled ? "text-green-700" : "text-amber-700"}`}>
              {enrolled ? "Currently enrolled — card is valid." : "No active enrolment at this time."}
            </p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-14 w-14 text-red-500" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-bold">Card not recognised</h1>
            <p className="mt-2 text-muted-foreground">
              We could not find a student with this number. The card may be invalid.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
