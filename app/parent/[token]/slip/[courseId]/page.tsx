import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getResultSlip } from "@/lib/assessment/slip";
import { ResultSlip } from "@/components/assessments/result-slip";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Statement of Results", robots: { index: false, follow: false } };

export default async function ParentSlipPage({ params }: { params: { token: string; courseId: string } }) {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(params.token)) notFound();
  const student = await prisma.user.findUnique({
    where: { parentShareToken: params.token },
    select: { id: true, isActive: true },
  });
  if (!student || !student.isActive) notFound();

  const data = await getResultSlip(params.courseId, student.id);
  if (!data) notFound();
  return <ResultSlip data={data} backHref={`/parent/${params.token}`} />;
}
