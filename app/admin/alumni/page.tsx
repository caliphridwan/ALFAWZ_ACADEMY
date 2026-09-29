import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlumnusPublishToggle } from "@/components/admin/alumnus-publish-toggle";
import { AlumnusReviewButtons } from "@/components/admin/alumnus-review-buttons";

export default async function AdminAlumniPage() {
  // AlumniStatus is declared PENDING, APPROVED, REJECTED, so ascending
  // order puts submissions awaiting review at the top.
  const alumni = await prisma.alumnus.findMany({
    orderBy: [{ status: "asc" }, { featured: "desc" }, { createdAt: "desc" }],
  });

  // Verification hint: does a submitter's email match a real student account?
  const emails = alumni.filter((a) => a.email).map((a) => a.email as string);
  const matchingUsers = emails.length
    ? await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { email: true, _count: { select: { enrollments: true } } },
      })
    : [];
  const enrollmentsByEmail = new Map(matchingUsers.map((u) => [u.email, u._count.enrollments]));

  const pendingCount = alumni.filter((a) => a.status === "PENDING").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Alumni</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-brand mt-1">
              {pendingCount} submission{pendingCount > 1 ? "s" : ""} awaiting review
            </p>
          )}
        </div>
        <Button asChild>
          <Link href="/admin/alumni/new">Add Alumnus</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {alumni.map((a) => {
          const enrollments = a.email ? enrollmentsByEmail.get(a.email) : undefined;
          return (
            <Card key={a.id} className={a.status === "PENDING" ? "border-gold/50" : undefined}>
              <CardContent className="p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">
                    {a.name}{" "}
                    <span className="text-muted-foreground font-normal">
                      · {a.program} · Class of {a.graduationYear}
                    </span>
                  </p>
                  {a.currentRole && <p className="text-sm text-muted-foreground mt-1">{a.currentRole}</p>}
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{a.story}</p>

                  {a.selfSubmitted && (
                    <div className="mt-3 rounded-md bg-muted/50 p-3 text-xs space-y-1">
                      <p>
                        <span className="text-muted-foreground">Private email:</span> {a.email}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Consent to display:</span>{" "}
                        {a.consentToDisplay ? "Given" : "Not given"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Student account:</span>{" "}
                        {enrollments === undefined
                          ? "No account with this email (verify another way)"
                          : `Found, ${enrollments} enrollment${enrollments === 1 ? "" : "s"}`}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant={a.status === "APPROVED" ? "default" : a.status === "PENDING" ? "gold" : "muted"}>
                      {a.status}
                    </Badge>
                    <Badge variant={a.published ? "default" : "muted"}>{a.published ? "Published" : "Hidden"}</Badge>
                    {a.featured && <Badge variant="gold">Featured</Badge>}
                    {a.selfSubmitted && <Badge variant="muted">Self-registered</Badge>}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 items-end">
                  {a.status !== "APPROVED" && <AlumnusReviewButtons id={a.id} status={a.status} />}
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/alumni/${a.id}/edit`}>Edit</Link>
                  </Button>
                  {a.status === "APPROVED" && <AlumnusPublishToggle id={a.id} published={a.published} />}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {alumni.length === 0 && (
          <p className="text-muted-foreground text-center py-12">No alumni added yet.</p>
        )}
      </div>
    </div>
  );
}
