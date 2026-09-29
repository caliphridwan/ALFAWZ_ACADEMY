import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils/cn";

const STATUS_VARIANT: Record<string, "default" | "muted" | "gold"> = {
  SUCCESSFUL: "default",
  PENDING: "gold",
  FAILED: "muted",
  REFUNDED: "muted",
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: { status?: string; type?: string; q?: string };
}) {
  const { status, type, q } = searchParams;

  const payments = await prisma.payment.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(type ? { type: type as any } : {}),
      ...(q
        ? {
            OR: [
              { reference: { contains: q, mode: "insensitive" } },
              { user: { email: { contains: q, mode: "insensitive" } } },
              { user: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { user: true, course: true },
    orderBy: { createdAt: "desc" },
    take: 150,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payments</h1>

      <form className="flex flex-wrap gap-3 mb-6" action="/admin/payments">
        <Input name="q" placeholder="Search reference, name or email..." defaultValue={q} className="max-w-xs" />
        <select name="status" defaultValue={status ?? ""} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All statuses</option>
          <option value="SUCCESSFUL">Successful</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <select name="type" defaultValue={type ?? ""} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All types</option>
          <option value="COURSE">Course</option>
          <option value="SPONSORSHIP">Sponsorship</option>
        </select>
      </form>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">User</th>
                <th className="p-4">Type</th>
                <th className="p-4">Course</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="p-4 font-mono text-xs">{p.reference}</td>
                  <td className="p-4">
                    <p className="font-medium">{p.user.name}</p>
                    <p className="text-xs text-muted-foreground">{p.user.email}</p>
                  </td>
                  <td className="p-4">{p.type}</td>
                  <td className="p-4 text-muted-foreground">{p.course?.title ?? "—"}</td>
                  <td className="p-4">{formatCurrency(Number(p.amount), p.currency)}</td>
                  <td className="p-4">
                    <Badge variant={STATUS_VARIANT[p.status] ?? "muted"}>{p.status}</Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">{p.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No payments match your filters.
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
