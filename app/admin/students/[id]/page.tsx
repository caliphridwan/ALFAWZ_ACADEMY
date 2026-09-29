import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentStatusToggle } from "@/components/admin/student-status-toggle";
import { formatCurrency } from "@/lib/utils/cn";

export default async function AdminStudentDetailPage({ params }: { params: { id: string } }) {
  const student = await prisma.user.findUnique({
    where: { id: params.id, role: "STUDENT" },
    include: {
      guardian: true,
      enrollments: { include: { course: true }, orderBy: { enrolledAt: "desc" } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!student) notFound();

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <p className="text-muted-foreground text-sm">{student.email}</p>
        </div>
        <StudentStatusToggle studentId={student.id} isActive={student.isActive} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-5 space-y-2 text-sm">
            <h2 className="font-semibold mb-2">Student Information</h2>
            <p><span className="text-muted-foreground">Phone:</span> {student.phone ?? "—"}</p>
            <p><span className="text-muted-foreground">Country:</span> {student.country ?? "—"}</p>
            <p>
              <span className="text-muted-foreground">Date of Birth:</span>{" "}
              {student.dateOfBirth ? student.dateOfBirth.toLocaleDateString() : "—"}
            </p>
            <p><span className="text-muted-foreground">Joined:</span> {student.createdAt.toLocaleDateString()}</p>
          </CardContent>
        </Card>

        {/* Guardian info shown only here, to authorized admin staff — never on public pages (Section 25). */}
        {student.guardian && (
          <Card>
            <CardContent className="p-5 space-y-2 text-sm">
              <h2 className="font-semibold mb-2">Guardian Information</h2>
              <p><span className="text-muted-foreground">Name:</span> {student.guardian.name}</p>
              <p><span className="text-muted-foreground">Email:</span> {student.guardian.email}</p>
              <p><span className="text-muted-foreground">Phone:</span> {student.guardian.phone}</p>
              <p><span className="text-muted-foreground">Relationship:</span> {student.guardian.relationship}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <h2 className="font-semibold mb-3">Enrollments</h2>
      <Card className="mb-8">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr><th className="p-4">Course</th><th className="p-4">Status</th><th className="p-4">Enrolled</th></tr>
            </thead>
            <tbody>
              {student.enrollments.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="p-4">{e.course.title}</td>
                  <td className="p-4"><Badge>{e.status}</Badge></td>
                  <td className="p-4 text-muted-foreground">{e.enrolledAt.toLocaleDateString()}</td>
                </tr>
              ))}
              {student.enrollments.length === 0 && (
                <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No enrollments yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <h2 className="font-semibold mb-3">Payments</h2>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr><th className="p-4">Reference</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Date</th></tr>
            </thead>
            <tbody>
              {student.payments.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-mono text-xs">{p.reference}</td>
                  <td className="p-4">{formatCurrency(Number(p.amount), p.currency)}</td>
                  <td className="p-4"><Badge variant={p.status === "SUCCESSFUL" ? "default" : "muted"}>{p.status}</Badge></td>
                  <td className="p-4 text-muted-foreground">{p.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
              {student.payments.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No payments yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
