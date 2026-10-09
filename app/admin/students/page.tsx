import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Section 25: search + filter students. Note passwordHash is never selected
 * here or anywhere in the admin UI (Section 25: "Do not expose passwords").
 */
export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const q = searchParams.q?.trim();
  const statusFilter = searchParams.status;

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      ...(statusFilter === "active" ? { isActive: true } : {}),
      ...(statusFilter === "inactive" ? { isActive: false } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      country: true,
      isActive: true,
      createdAt: true,
      _count: { select: { enrollments: true, payments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <Button asChild>
          <Link href="/admin/students/new">Add Student</Link>
        </Button>
      </div>

      <form className="flex gap-3 mb-6" action="/admin/students">
        <Input name="q" placeholder="Search by name or email..." defaultValue={q} className="max-w-sm" />
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          className="h-11 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </form>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Country</th>
                <th className="p-4">Enrollments</th>
                <th className="p-4">Payments</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="p-4">
                    <Link href={`/admin/students/${s.id}`} className="font-medium hover:text-brand">
                      {s.name}
                    </Link>
                  </td>
                  <td className="p-4 text-muted-foreground">{s.email}</td>
                  <td className="p-4 text-muted-foreground">{s.country ?? "—"}</td>
                  <td className="p-4">{s._count.enrollments}</td>
                  <td className="p-4">{s._count.payments}</td>
                  <td className="p-4">
                    <Badge variant={s.isActive ? "default" : "muted"}>
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {s.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No students match your search.
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
