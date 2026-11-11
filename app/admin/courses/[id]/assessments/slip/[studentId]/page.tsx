import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getResultSlip } from "@/lib/assessment/slip";
import { ResultSlip } from "@/components/assessments/result-slip";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Statement of Results", robots: { index: false, follow: false } };

export default async function AdminSlipPage({ params }: { params: { id: string; studentId: string } }) {
  await requireAdmin();
  const data = await getResultSlip(params.id, params.studentId);
  if (!data) notFound();
  return <ResultSlip data={data} backHref={`/admin/courses/${params.id}/assessments/results`} />;
}
