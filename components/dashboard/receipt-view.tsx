import { formatCurrency } from "@/lib/utils/cn";
import { PrintButton } from "@/components/dashboard/print-button";

type ReceiptPayment = {
  reference: string;
  type: "COURSE" | "SPONSORSHIP";
  amount: unknown; // Prisma Decimal
  currency: string;
  paidAt: Date | null;
  course: { title: string } | null;
  user: { name: string };
};

export function ReceiptView({ payment }: { payment: ReceiptPayment }) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded-xl border border-border bg-card p-8 print:border-0 print:shadow-none">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-brand">AlFawz Academy</h1>
          <span className="text-xs text-muted-foreground">Official Receipt</span>
        </div>

        <dl className="space-y-3 text-sm">
          <Row label="Received from" value={payment.user.name} />
          <Row label="Transaction reference" value={payment.reference} mono />
          <Row label="Payment type" value={payment.type === "COURSE" ? "Course Payment" : "Sponsorship"} />
          {payment.course && <Row label="Course" value={payment.course.title} />}
          <Row label="Amount" value={formatCurrency(Number(payment.amount), payment.currency)} />
          <Row label="Date" value={payment.paidAt ? new Date(payment.paidAt).toLocaleString() : "—"} />
          <Row label="Status" value="Successful" />
        </dl>
      </div>

      <div className="mt-6 print:hidden">
        <PrintButton />
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between border-b border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-xs" : "font-medium"}>{value}</dd>
    </div>
  );
}
