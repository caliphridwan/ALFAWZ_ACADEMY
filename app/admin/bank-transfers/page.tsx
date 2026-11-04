import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/cn";
import { BankClaimActions } from "@/components/admin/review-actions";

export const dynamic = "force-dynamic";

export default async function AdminBankTransfersPage() {
  const [pending, recent] = await Promise.all([
    prisma.bankTransferClaim.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        student: { select: { name: true, email: true } },
        course: { select: { title: true, price: true, currency: true } },
      },
    }),
    prisma.bankTransferClaim.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { reviewedAt: "desc" },
      take: 15,
      include: { student: { select: { name: true } }, course: { select: { title: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Bank Transfers</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        Students who paid by bank transfer submit a receipt here. Check the amount in your bank account, then approve
        to enrol them (the payment is recorded as revenue).
      </p>

      <h2 className="font-semibold mb-3">Waiting for review ({pending.length})</h2>
      <div className="space-y-4 max-w-3xl">
        {pending.map((c) => {
          const price = Number(c.course.price);
          const sent = Number(c.amount);
          const mismatch = Math.abs(price - sent) > 0.5;
          return (
            <Card key={c.id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{c.student.name}</p>
                    <p className="text-xs text-muted-foreground">{c.student.email}</p>
                  </div>
                  <Badge variant={mismatch ? "gold" : "default"}>
                    {formatCurrency(sent, c.course.currency)} {mismatch ? `(price ${formatCurrency(price, c.course.currency)})` : ""}
                  </Badge>
                </div>
                <p className="text-sm">
                  For <span className="font-medium">{c.course.title}</span> · sent by{" "}
                  <span className="font-medium">{c.senderName}</span>
                  {c.paidOn ? ` on ${c.paidOn.toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" })}` : ""}
                </p>
                {c.note && <p className="text-sm text-muted-foreground">“{c.note}”</p>}
                {c.receiptUrl ? (
                  <a href={c.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.receiptUrl}
                      alt="Receipt"
                      className="max-h-40 rounded-md border border-border object-contain"
                    />
                    <span className="mt-1 block text-xs text-brand underline">Open full receipt</span>
                  </a>
                ) : (
                  <p className="text-xs text-muted-foreground">No receipt attached.</p>
                )}
                <BankClaimActions claimId={c.id} amountMismatch={mismatch} />
              </CardContent>
            </Card>
          );
        })}
        {pending.length === 0 && <p className="text-sm text-muted-foreground">Nothing waiting. 🎉</p>}
      </div>

      {recent.length > 0 && (
        <>
          <h2 className="font-semibold mt-12 mb-3">Recently reviewed</h2>
          <div className="space-y-2 max-w-3xl">
            {recent.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-3 text-sm">
                <span>
                  {c.student.name} — {c.course.title}
                </span>
                <Badge variant={c.status === "APPROVED" ? "default" : "muted"}>
                  {c.status === "APPROVED" ? "Approved" : "Declined"}
                </Badge>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
