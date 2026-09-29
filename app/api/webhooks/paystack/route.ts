import { NextRequest, NextResponse } from "next/server";
import { isValidPaystackSignature } from "@/lib/paystack/webhook-verify";
import { applyVerifiedPayment } from "@/lib/paystack/apply-payment";
import { verifyTransaction } from "@/lib/paystack/client";

/**
 * Section 42: the belt-and-braces path. Even if a student closes their
 * browser right after paying (never hitting the callback route), this
 * webhook still activates their enrollment/sponsorship — and if the
 * callback already did it, applyVerifiedPayment's idempotency guard makes
 * this a safe no-op.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!isValidPaystackSignature(rawBody, signature)) {
    console.warn("Rejected webhook: invalid Paystack signature.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event !== "charge.success") {
    // Acknowledge other event types without acting on them.
    return NextResponse.json({ received: true });
  }

  try {
    // Re-verify with Paystack's REST API rather than trusting the webhook
    // payload's own "status" field at face value — belt AND braces.
    const verification = await verifyTransaction(event.data.reference);
    await applyVerifiedPayment(verification.data);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    // Return 500 so Paystack retries delivery.
    return NextResponse.json({ error: "Processing error." }, { status: 500 });
  }
}
