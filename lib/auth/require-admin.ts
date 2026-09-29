import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

/**
 * Layouts stop navigation, but a server action can still be invoked directly
 * (e.g. a forged form POST) — so every admin mutation calls this first.
 * Throws, which surfaces as an error boundary / rejected action; callers in
 * this codebase treat a thrown error here as "unauthorized".
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized: admin access required.");
  }
  return session;
}
