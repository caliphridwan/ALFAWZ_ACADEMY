"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, wire this up to an error-tracking service.
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="container py-24 flex flex-col items-center text-center max-w-md mx-auto">
          <AlertTriangle className="text-destructive mb-6" size={48} />
          <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-8">
            We&apos;ve hit an unexpected error. Please try again, or contact
            us if the problem continues.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => reset()}>Try Again</Button>
            <Button asChild variant="outline">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
