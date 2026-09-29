import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Hear from students and families about their experience learning with AlFawz Academy.",
};

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container py-16">
      <div className="max-w-2xl mx-auto text-center mb-14">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">What Our Students Say</h1>
        <p className="text-muted-foreground">
          Real experiences from students and families learning with AlFawz Academy.
        </p>
      </div>

      {testimonials.length === 0 ? (
        <p className="text-muted-foreground text-center">No testimonials published yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <blockquote key={t.id} className="rounded-lg border border-border p-6 bg-card">
              <p className="text-sm text-muted-foreground mb-4">&ldquo;{t.content}&rdquo;</p>
              <footer className="flex items-center gap-3">
                {t.image && (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-brand/10">
                    <Image src={t.image} alt={t.name} fill className="object-cover" />
                  </div>
                )}
                <div className="text-sm font-medium">
                  {t.name}
                  {t.country ? <span className="text-muted-foreground font-normal">, {t.country}</span> : null}
                  {t.course ? <span className="block text-xs text-muted-foreground font-normal mt-0.5">{t.course}</span> : null}
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      )}
    </div>
  );
}
