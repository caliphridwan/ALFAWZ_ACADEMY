import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkReadButton, MarkAllReadButton } from "@/components/dashboard/notification-buttons";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  const notifications = await prisma.notification.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unread > 0 && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            You have no notifications yet. Enrollment and payment confirmations will appear here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={n.read ? "opacity-70" : "border-brand/30"}>
              <CardContent className="p-5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{n.title}</p>
                    {!n.read && <Badge>New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {n.createdAt.toLocaleString()}
                  </p>
                </div>
                {!n.read && <MarkReadButton id={n.id} />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
