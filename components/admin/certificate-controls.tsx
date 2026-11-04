"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { issueCertificate, revokeCertificate } from "@/app/admin/students/actions";

export function CertificateControls({
  enrollmentId,
  certificateNumber,
}: {
  enrollmentId: string;
  certificateNumber: string | null;
}) {
  const [pending, startTransition] = useTransition();

  function issue() {
    if (
      !confirm(
        "Mark this course as completed and issue a certificate? The student will be notified."
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await issueCertificate(enrollmentId);
        toast.success("Certificate issued.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not issue the certificate.");
      }
    });
  }

  function revoke() {
    if (!confirm("Revoke this certificate? Its verification link will stop working.")) return;
    startTransition(async () => {
      try {
        await revokeCertificate(enrollmentId);
        toast.success("Certificate revoked.");
      } catch {
        toast.error("Could not revoke the certificate.");
      }
    });
  }

  if (certificateNumber) {
    return (
      <div className="space-y-2">
        <a
          href={`/certificate/${certificateNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-mono text-xs text-brand hover:underline"
        >
          {certificateNumber}
        </a>
        <Button size="sm" variant="outline" onClick={revoke} disabled={pending}>
          Revoke
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" onClick={issue} disabled={pending}>
      Complete &amp; Issue
    </Button>
  );
}
