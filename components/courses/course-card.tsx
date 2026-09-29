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
    <Card className="overflow-hidden group hover:shadow-md transition-shadow">
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
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {course.shortDescription}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span>{course.duration}</span>
          <span>{course.ageGroup}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-brand">
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
