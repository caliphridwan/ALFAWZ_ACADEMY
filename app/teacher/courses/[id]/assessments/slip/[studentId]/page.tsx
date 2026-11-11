import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireCourseStaff } from "@/lib/auth/course-access";
import { getResultSlip } from "@/lib/assessment/slip";
import { ResultSlip } from "@/components/assessments/result-slip";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Statement of Results", robots: { index: false, follow: false } };

export default async function TeacherSlipPage({ params }: { params: { id: string; studentId: string } }) {
  await requireCourseStaff(params.id); // teachers only for their own courses
  const data = await getResultSlip(params.id, params.studentId);
  if (!data) notFound();
  return <ResultSlip data={data} backHref={`/teacher/courses/${params.id}/assessments/results`} />;
}
