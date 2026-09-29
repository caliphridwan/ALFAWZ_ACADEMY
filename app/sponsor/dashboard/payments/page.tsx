import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/cn";

const STATUS_VARIANT: Record<string, "default" | "muted" | "gold"> = {
  SUCCESSFUL: "default",
  PENDING: "gold",
  FAILED: "muted",
  REFUNDED: "muted",
};

export default async function SponsorPaymentsPage() {
  const session = await getServerSession(authOptions);
  const payments = await prisma.payment.findMany({
    where: { userId: session!.user.id, type: "SPONSORSHIP" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-mono text-xs">{p.reference}</td>
                  <td className="p-4">{formatCurrency(Number(p.amount), p.currency)}</td>
                  <td className="p-4">
                    <Badge variant={STATUS_VARIANT[p.status] ?? "muted"}>{p.status}</Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">{p.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No sponsorship payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
