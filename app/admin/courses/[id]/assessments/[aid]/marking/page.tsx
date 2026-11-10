import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { MarkingView } from "@/components/assessments/marking-view";

export const dynamic = "force-dynamic";

export default async function AdminMarkingPage({ params }: { params: { id: string; aid: string } }) {
  const assessment = await prisma.assessment.findFirst({ where: { id: params.aid, courseId: params.id }, select: { title: true } });
  if (!assessment) notFound();

  return (
    <div>
      <Link href={`/admin/courses/${params.id}/assessments/${params.aid}`} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to the assessment
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Marking — {assessment.title}</h1>
      <MarkingView assessmentId={params.aid} courseId={params.id} />
    </div>
  );
}
