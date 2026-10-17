import { NextRequest, NextResponse } from "next/server";
import { sendNeverEnrolledReminders } from "@/lib/enrollment-reminders";

/**
 * Triggered by a scheduled job (see render.yaml) rather than a person, so
 * it's protected by the same shared CRON_SECRET used by the payment
 * reminders route — if it isn't set, this route refuses every request
 * rather than silently running unauthenticated.
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
    const result = await sendNeverEnrolledReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Enrollment reminder run failed:", err);
    return NextResponse.json({ ok: false, error: "Internal error." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}
