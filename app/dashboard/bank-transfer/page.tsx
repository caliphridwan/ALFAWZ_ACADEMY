import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { getBankTransferInfo } from "@/lib/bank-details";
import { BankTransferDetails } from "@/components/payments/bank-transfer-details";
import { BankClaimForm } from "@/components/payments/bank-claim-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

const STATUS_LABEL = { PENDING: "Under review", APPROVED: "Approved", REJECTED: "Not approved" } as const;
const STATUS_VARIANT = { PENDING: "gold", APPROVED: "default", REJECTED: "muted" } as const;

export default async function BankTransferPage({ searchParams }: { searchParams: { course?: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [courses, claims, bankInfo] = await Promise.all([
    prisma.course.findMany({
      where: { active: true, enrollmentOpen: true },
      select: { id: true, title: true, price: true, currency: true },
      orderBy: { title: "asc" },
    }),
    prisma.bankTransferClaim.findMany({
      where: { studentId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { course: { select: { title: true } } },
    }),
    getBankTransferInfo(),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Paid by bank transfer?</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Send us your receipt and we&apos;ll confirm your payment and activate your course.
      </p>

      <div className="mb-8">
        <BankTransferDetails info={bankInfo} purpose="my course" compact />
      </div>

      {courses.length === 0 ? (
        <p className="text-muted-foreground">No courses are open for enrolment right now.</p>
      ) : (
        <BankClaimForm
          courses={courses.map((c) => ({
            id: c.id,
            title: c.title,
            price: Number(c.price),
            currency: c.currency,
          }))}
          initialCourseId={searchParams.course}
        />
      )}

      {claims.length > 0 && (
        <>
          <h2 className="font-semibold mt-12 mb-3">Your receipts</h2>
          <div className="space-y-3">
            {claims.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{c.course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(Number(c.amount), "NGN")} · sent{" "}
                      {c.createdAt.toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" })}
                    </p>
                    {c.status === "REJECTED" && c.reviewNote && (
                      <p className="mt-1 text-sm text-destructive">{c.reviewNote}</p>
                    )}
                  </div>
                  <Badge variant={STATUS_VARIANT[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <p className="mt-10 text-sm text-muted-foreground">
        Can&apos;t afford the fee?{" "}
        <Link href="/dashboard/scholarship" className="text-brand underline">
          Apply for a scholarship
        </Link>
        .
      </p>
    </div>
  );
}
