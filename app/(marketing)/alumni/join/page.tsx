import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { AlumniJoinForm } from "@/components/marketing/alumni-join-form";

export const metadata: Metadata = {
  title: "Register as Alumni",
  description: "Graduated from AlFawz Academy? Register as an alumnus and share your story.",
};

export default async function AlumniJoinPage() {
  const courses = await prisma.course.findMany({
    where: { active: true },
    select: { title: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="container py-16 max-w-2xl">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">Register as Alumni</h1>
      <p className="text-muted-foreground mb-8">
        Studied with AlFawz Academy? Tell us about your journey. Every
        submission is reviewed by our team before anything is shown publicly,
        and your email is never displayed.
      </p>
      <AlumniJoinForm programSuggestions={courses.map((c) => c.title)} />
    </div>
  );
}
