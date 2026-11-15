import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/cn";

export type CourseCardData = {
  slug: string;
  title: string;
  shortDescription: string;
  image?: string | null;
  level: string;
  duration: string;
  price: number;
  currency: string;
  ageGroup: string;
  instructorName?: string;
  enrollmentOpen: boolean;
};

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Card className="overflow-hidden group flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/10">
      <div className="aspect-[16/10] bg-brand/5 relative overflow-hidden">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-[radial-gradient(circle_at_50%_30%,hsl(var(--brand)/0.15),transparent_70%)]" />
        )}
        <Badge className="absolute top-3 left-3 bg-background/90">{course.level}</Badge>
      </div>
      <CardContent className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold leading-snug mb-1.5">{course.title}</h3>
        <p className="text-sm leading-6 text-muted-foreground line-clamp-3 mb-4">
          {course.shortDescription}
        </p>
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{course.duration}</span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{course.ageGroup}</span>
          <span
            className={
              course.enrollmentOpen
                ? "rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700"
                : "rounded-full bg-muted px-2.5 py-1 text-muted-foreground"
            }
          >
            {course.enrollmentOpen ? "Enrolment open" : "Enrolment closed"}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4">
          <span className="text-lg font-bold text-brand">
            {formatCurrency(course.price, course.currency)}
          </span>
          <Button asChild size="sm" variant={course.enrollmentOpen ? "default" : "outline"}>
            <Link href={`/courses/${course.slug}`}>View Course</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
