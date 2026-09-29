import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore AlFawz Academy's learning programs — a structured pathway from beginner Qur'an recitation to advanced Islamic studies, for every age and location.",
};

export default async function ProgramsPage() {
  const programs = await prisma.course.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="container py-16">
      <div className="max-w-2xl mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Our Programs</h1>
        <p className="text-muted-foreground">
          Every program follows a structured curriculum so students always
          know where they are and what comes next. Choose the one that fits
          your age and current level.
        </p>
      </div>

      {programs.length === 0 ? (
        <p className="text-muted-foreground">Programs will be listed here soon.</p>
      ) : (
        <ol className="space-y-4 max-w-3xl">
          {programs.map((p, i) => (
            <li key={p.id}>
              <Card>
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-sm font-semibold">
                      {i + 1}
                    </span>
                    <div>
                      <h2 className="font-semibold text-lg">{p.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{p.shortDescription}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge>{p.level}</Badge>
                        <Badge variant="muted">{p.ageGroup}</Badge>
                        <Badge variant="muted">{p.duration}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                    <span className="font-semibold text-brand">
                      {formatCurrency(Number(p.price), p.currency)}
                    </span>
                    <Button asChild size="sm">
                      <Link href={`/courses/${p.slug}`}>View Program</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
