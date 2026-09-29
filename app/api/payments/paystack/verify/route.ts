import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack/client";
import { applyVerifiedPayment } from "@/lib/paystack/apply-payment";
import { paymentVerifySchema } from "@/lib/validations/schemas";

/**
 * Section 15 step 9: after Paystack redirects the browser back to us, we
 * verify with Paystack's servers before telling the student anything
 * succeeded. This route (not the redirect URL, not any query param) is the
 * only thing allowed to decide that.
 */
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  const parsed = paymentVerifySchema.safeParse({ reference });
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing payment reference." }, { status: 400 });
  }

  try {
    const verification = await verifyTransaction(parsed.data.reference);
    if (!verification.status) {
      return NextResponse.json({ error: "Verification failed." }, { status: 502 });
    }

    const result = await applyVerifiedPayment(verification.data);

    switch (result.outcome) {
      case "applied":
      case "already_processed":
        return NextResponse.json({ status: "success" });
      case "amount_mismatch":
        return NextResponse.json({ status: "failed", reason: "amount_mismatch" }, { status: 409 });
      case "marked_failed":
        return NextResponse.json({ status: "failed" });
      case "not_found":
        return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json({ error: "Could not verify payment right now." }, { status: 502 });
  }
}
