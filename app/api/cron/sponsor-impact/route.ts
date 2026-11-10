import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendImpactUpdatesToSponsors } from "@/lib/sponsor-impact-send";
import { notifyAdmins } from "@/lib/notify-admins";

/**
 * Monthly sponsor impact update. Protected by CRON_SECRET like the other cron
 * routes. Skips if an update already went out in the last 20 days, so a retry
 * or a second trigger in the same month can't email sponsors twice.
 */
function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function run(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const since = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    const recent = await prisma.notification.findFirst({
      where: { title: "Your impact update", createdAt: { gte: since } },
      select: { id: true },
    });
    if (recent) return NextResponse.json({ ok: true, skipped: "already sent this month" });

    const result = await sendImpactUpdatesToSponsors();
    if (result.ok) {
      await notifyAdmins(
        "Monthly sponsor update sent",
        `This month's impact update went to ${result.sent} sponsor${result.sent === 1 ? "" : "s"}${result.failed ? ` (${result.failed} failed)` : ""}. Edit figures any time under Sponsors > Edit impact figures.`
      );
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("Sponsor impact run failed:", err);
    return NextResponse.json({ ok: false, error: "Internal error." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}
