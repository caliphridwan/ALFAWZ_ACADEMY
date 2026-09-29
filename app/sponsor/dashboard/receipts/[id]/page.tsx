import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { ReceiptView } from "@/components/dashboard/receipt-view";

export default async function SponsorReceiptPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: { course: true, user: true },
  });

  // A sponsor may only ever see their own receipt.
  if (!payment || payment.userId !== session!.user.id || payment.status !== "SUCCESSFUL") {
    notFound();
  }

  return <ReceiptView payment={payment} />;
}
