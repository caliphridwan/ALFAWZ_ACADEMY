import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { chatAccess, loadSnapshot } from "@/lib/chat";
import { ChatRoom } from "@/components/chat/chat-room";

/** Shared server wrapper: checks access, loads the first batch, renders the room. */
export async function ChatPageBody({ courseId }: { courseId: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const viewer = { id: session.user.id, role: session.user.role as string };
  const access = await chatAccess(courseId, viewer);
  if (!access.ok) notFound();
  const initial = await loadSnapshot(courseId, viewer, access.canModerate);
  return <ChatRoom courseId={courseId} meId={viewer.id} canModerate={access.canModerate} initial={initial} />;
}
