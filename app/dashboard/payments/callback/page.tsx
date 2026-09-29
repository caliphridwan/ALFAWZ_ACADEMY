"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type VerifyState = "verifying" | "success" | "failed";

/**
 * This page never assumes success just because Paystack redirected here —
 * it calls our own server route, which re-checks with Paystack directly
 * (Section 15 step 9). The webhook is a parallel safety net in case the
 * student never reaches this page at all.
 */
export default function PaymentCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<VerifyState>("verifying");

  useEffect(() => {
    const reference = params.get("reference") ?? params.get("trxref");
    if (!reference) {
      setState("failed");
      return;
    }

    fetch(`/api/payments/paystack/verify?reference=${encodeURIComponent(reference)}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setState(ok && data.status === "success" ? "success" : "failed");
      })
      .catch(() => setState("failed"));
  }, [params]);

  return (
    <div className="container py-24 flex flex-col items-center text-center max-w-md mx-auto">
      {state === "verifying" && (
        <>
          <Loader2 className="animate-spin text-brand mb-6" size={48} />
          <h1 className="text-xl font-semibold mb-2">Verifying your payment...</h1>
          <p className="text-muted-foreground text-sm">
            Please don&apos;t close this page — this only takes a moment.
          </p>
        </>
      )}
      {state === "success" && (
        <>
          <CheckCircle2 className="text-brand mb-6" size={48} />
          <h1 className="text-2xl font-semibold mb-2">Payment confirmed</h1>
          <p className="text-muted-foreground mb-8">
            Jazakumullahu khairan — your enrollment is now active. You can start
            learning from your dashboard.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </>
      )}
      {state === "failed" && (
        <>
          <XCircle className="text-destructive mb-6" size={48} />
          <h1 className="text-2xl font-semibold mb-2">We couldn&apos;t confirm this payment</h1>
          <p className="text-muted-foreground mb-8">
            If an amount was deducted, it will be automatically reconciled
            shortly, or you can contact support with your reference number.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button onClick={() => router.push("/dashboard/payments")}>View Payments</Button>
          </div>
        </>
      )}
    </div>
  );
}
