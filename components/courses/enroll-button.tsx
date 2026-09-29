"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function EnrollButton({ courseId, courseSlug }: { courseId: string; courseSlug: string }) {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleEnroll() {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/courses/${courseSlug}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payments/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Server has already created the pending payment/enrollment and
      // confirmed a real Paystack checkout URL — safe to redirect.
      window.location.href = data.authorizationUrl;
    } catch {
      toast.error("Network error — please try again.");
      setLoading(false);
    }
  }

  return (
    <Button size="lg" onClick={handleEnroll} disabled={loading} className="w-full sm:w-auto">
      {loading ? "Preparing checkout..." : "Enroll Now"}
    </Button>
  );
}
