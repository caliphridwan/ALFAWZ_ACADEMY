"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type VerifyState = "verifying" | "success" | "failed";

export default function SponsorCallbackPage() {
  const params = useSearchParams();
  const [state, setState] = useState<VerifyState>("verifying");

  useEffect(() => {
    const reference = params.get("reference") ?? params.get("trxref");
    if (!reference) {
      setState("failed");
      return;
    }
    fetch(`/api/payments/paystack/verify?reference=${encodeURIComponent(reference)}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => setState(ok && data.status === "success" ? "success" : "failed"))
      .catch(() => setState("failed"));
  }, [params]);

  return (
    <div className="container py-24 flex flex-col items-center text-center max-w-md mx-auto">
      {state === "verifying" && (
        <>
          <Loader2 className="animate-spin text-brand mb-6" size={48} />
          <h1 className="text-xl font-semibold mb-2">Verifying your payment...</h1>
        </>
      )}
      {state === "success" && (
        <>
          <CheckCircle2 className="text-brand mb-6" size={48} />
          <h1 className="text-2xl font-semibold mb-2">Jazakallahu Khairan</h1>
          <p className="text-muted-foreground mb-8">
            Your sponsorship is now active. Check your email for a
            confirmation, plus a separate link to set up your sponsor
            dashboard, and your support will appear on our Sponsors page if
            you opted in.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/sponsors">View Sponsors Page</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </div>
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
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </>
      )}
    </div>
  );
}
