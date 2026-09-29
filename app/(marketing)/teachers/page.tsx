import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Our Teachers",
  description: "Meet the qualified teachers delivering AlFawz Academy's online Qur'an and Islamic education courses.",
};

export default async function TeachersPage() {
  const teachers = await prisma.teacher.findMany({
    where: { active: true },
    include: { courses: { where: { active: true }, select: { title: true, slug: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="container py-16">
      <div className="max-w-2xl mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Our Teachers</h1>
        <p className="text-muted-foreground">
          Qualified teachers dedicated to guiding students through the
          Qur&apos;an and Islamic knowledge with patience and care.
        </p>
      </div>

      {teachers.length === 0 ? (
        <p className="text-muted-foreground">Teacher profiles will be added soon.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-6">
                <div className="aspect-square rounded-full w-20 h-20 bg-brand/10 mb-4 overflow-hidden">
                  {t.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <h3 className="font-semibold text-lg">{t.name}</h3>
                {t.qualification && (
                  <p className="text-xs text-muted-foreground mb-1">{t.qualification}</p>
                )}
                {t.specialization && (
                  <p className="text-sm text-brand mb-3">{t.specialization}</p>
                )}
                {t.biography && (
                  <p className="text-sm text-muted-foreground line-clamp-4 mb-3">{t.biography}</p>
                )}
                {t.courses.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Teaches: {t.courses.map((c) => c.title).join(", ")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
