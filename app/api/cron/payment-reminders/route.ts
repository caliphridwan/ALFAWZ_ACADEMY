import { NextRequest, NextResponse } from "next/server";
import { sendPendingPaymentReminders } from "@/lib/payment-reminders";

/**
 * Triggered by a scheduled job (see render.yaml's cron service) rather than
 * a person, so it's protected by a shared secret instead of a user session.
 * CRON_SECRET must be set in the environment — if it isn't, this route
 * refuses every request rather than silently running unauthenticated.
 */
function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

async function run(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await sendPendingPaymentReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Payment reminder run failed:", err);
    return NextResponse.json({ ok: false, error: "Internal error." }, { status: 500 });
  }
}

// Accept both — a cron job typically issues a GET or POST depending on how
// it's configured, and this endpoint does the same thing either way.
export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}
