import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { getResultSlip } from "@/lib/assessment/slip";
import { ResultSlip } from "@/components/assessments/result-slip";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Statement of Results", robots: { index: false, follow: false } };

export default async function StudentSlipPage({ params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  const data = await getResultSlip(params.courseId, session!.user.id);
  if (!data) notFound();
  return <ResultSlip data={data} backHref="/dashboard/assessments" />;
}
