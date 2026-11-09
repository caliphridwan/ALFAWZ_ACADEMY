import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarkReadOnOpen } from "@/components/dashboard/mark-read-on-open";
import { notificationTarget } from "@/lib/notification-links";

export const dynamic = "force-dynamic";

export default async function NotificationDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  // userId in the filter: a student can only ever open their own notifications.
  const notification = await prisma.notification.findFirst({
    where: { id: params.id, userId: session!.user.id },
  });
  if (!notification) notFound();

  const target = notificationTarget(notification.title);

  return (
    <div className="max-w-2xl">
      <Link
        href="/dashboard/notifications"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} /> All notifications
      </Link>

      {!notification.read && <MarkReadOnOpen id={notification.id} />}

      <Card>
        <CardContent className="p-6 sm:p-8">
          <h1 className="text-xl font-bold sm:text-2xl">{notification.title}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{notification.createdAt.toLocaleString()}</p>
          <p className="mt-6 whitespace-pre-line text-base leading-relaxed">{notification.message}</p>
          {target && (
            <Button asChild className="mt-8">
              <Link href={target.href}>{target.label}</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
