import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminTeachersPage() {
  const teachers = await prisma.teacher.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Teachers</h1>
        <Button asChild>
          <Link href="/admin/teachers/new">Add Teacher</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr><th className="p-4">Name</th><th className="p-4">Specialization</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="p-4 font-medium">{t.name}</td>
                  <td className="p-4 text-muted-foreground">{t.specialization ?? "—"}</td>
                  <td className="p-4"><Badge variant={t.active ? "default" : "muted"}>{t.active ? "Active" : "Inactive"}</Badge></td>
                  <td className="p-4 text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/teachers/${t.id}/edit`}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No teachers added yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
