import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/cn";
import Link from "next/link";

const STATUS_VARIANT: Record<string, "default" | "gold" | "muted"> = {
  SUCCESSFUL: "default",
  PENDING: "gold",
  FAILED: "muted",
  REFUNDED: "muted",
};

export default async function PaymentsHistoryPage() {
  const session = await getServerSession(authOptions);
  const payments = await prisma.payment.findMany({
    where: { userId: session!.user.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Payment History</h1>

      {payments.length === 0 ? (
        <p className="text-muted-foreground">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Course / Type</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Reference</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-4">{p.course?.title ?? "Sponsorship"}</td>
                  <td className="p-4">{formatCurrency(Number(p.amount), p.currency)}</td>
                  <td className="p-4 text-muted-foreground">
                    {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-mono text-xs text-muted-foreground">{p.reference}</td>
                  <td className="p-4">
                    <Badge variant={STATUS_VARIANT[p.status] ?? "muted"}>{p.status}</Badge>
                  </td>
                  <td className="p-4">
                    {p.status === "SUCCESSFUL" && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/payments/${p.id}/receipt`}>Receipt</Link>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
