import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TestimonialPublishToggle } from "@/components/admin/testimonial-publish-toggle";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <Button asChild>
          <Link href="/admin/testimonials/new">Add Testimonial</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {testimonials.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">
                  {t.name} {t.country && <span className="text-muted-foreground font-normal">· {t.country}</span>}
                </p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.content}</p>
                <Badge variant={t.published ? "default" : "muted"} className="mt-2">
                  {t.published ? "Published" : "Draft"}
                </Badge>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/testimonials/${t.id}/edit`}>Edit</Link>
                </Button>
                <TestimonialPublishToggle id={t.id} published={t.published} />
              </div>
            </CardContent>
          </Card>
        ))}
        {testimonials.length === 0 && (
          <p className="text-muted-foreground text-center py-12">No testimonials yet.</p>
        )}
      </div>
    </div>
  );
}
