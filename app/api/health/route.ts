import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * For uptime monitors (e.g. UptimeRobot). 200 = the site AND its database
 * are answering; 503 = the database can't be reached. Reveals nothing else.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Health check failed:", err);
    return NextResponse.json({ status: "database unreachable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
