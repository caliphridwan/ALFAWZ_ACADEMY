import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/cn";

export default async function SponsorReceiptsPage() {
  const session = await getServerSession(authOptions);
  const receipts = await prisma.payment.findMany({
    where: { userId: session!.user.id, type: "SPONSORSHIP", status: "SUCCESSFUL" },
    orderBy: { paidAt: "desc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Receipts</h1>

      <div className="space-y-3">
        {receipts.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="font-medium">{formatCurrency(Number(r.amount), r.currency)}</p>
                <p className="text-xs text-muted-foreground">
                  {r.paidAt ? new Date(r.paidAt).toLocaleDateString() : "—"} · {r.reference}
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/sponsor/dashboard/receipts/${r.id}`}>View Receipt</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {receipts.length === 0 && (
          <p className="text-muted-foreground text-sm">No receipts yet — successful sponsorship payments will appear here.</p>
        )}
      </div>
    </div>
  );
}
