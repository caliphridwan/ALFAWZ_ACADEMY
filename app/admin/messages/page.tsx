import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageStatusControls } from "@/components/admin/message-status-controls";

const STATUS_VARIANT: Record<string, "default" | "gold" | "muted"> = {
  NEW: "gold",
  READ: "default",
  RESOLVED: "muted",
};

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>

      <div className="space-y-4">
        {messages.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-medium">{m.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.name} · {m.email} · {m.createdAt.toLocaleString()}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{m.message}</p>
              <MessageStatusControls messageId={m.id} status={m.status} />
            </CardContent>
          </Card>
        ))}
        {messages.length === 0 && (
          <p className="text-muted-foreground text-center py-12">No contact messages yet.</p>
        )}
      </div>
    </div>
  );
}
