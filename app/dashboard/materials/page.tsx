import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toForceDownloadUrl } from "@/lib/utils/cn";

export default async function MaterialsPage() {
  const session = await getServerSession(authOptions);

  // Only courses the student actually has access to — active or completed
  // enrollment, same access logic used elsewhere (e.g. "Continue Learning").
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session!.user.id, status: { in: ["ACTIVE", "COMPLETED"] } },
    include: { course: { include: { materials: { orderBy: { uploadedAt: "desc" } } } } },
    orderBy: { enrolledAt: "desc" },
  });

  const coursesWithMaterials = enrollments.filter((e) => e.course.materials.length > 0);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Class Materials</h1>

      {coursesWithMaterials.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              No materials have been uploaded for your courses yet — check back soon.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {coursesWithMaterials.map((e) => (
            <div key={e.id}>
              <h2 className="font-semibold mb-3">{e.course.title}</h2>
              <div className="space-y-3">
                {e.course.materials.map((m) => (
                  <Card key={m.id}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <FileText size={18} className="text-brand shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{m.title}</p>
                          {m.description && (
                            <p className="text-sm text-muted-foreground truncate">{m.description}</p>
                          )}
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline" className="shrink-0">
                        <a href={toForceDownloadUrl(m.fileUrl)} target="_blank" rel="noopener noreferrer">
                          <Download size={14} className="mr-1.5" />
                          Download
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
