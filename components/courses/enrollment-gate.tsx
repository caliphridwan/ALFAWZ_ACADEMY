"use client";

import { useState } from "react";
import { EnrollButton } from "@/components/courses/enroll-button";
import { RegistrationCountdown } from "@/components/courses/registration-countdown";

/**
 * Combines the admin's enrollmentOpen toggle with the optional
 * registrationClosesAt deadline. The deadline is checked once on the server
 * (closesAtPassedOnServer) so a page loaded after the deadline already shows
 * the closed state, and again live in the browser via the countdown's
 * onClose callback so a page left open through the deadline updates without
 * a refresh.
 */
export function EnrollmentGate({
  courseId,
  courseSlug,
  enrollmentOpen,
  closesAt,
  closesAtPassedOnServer,
  label = "Enroll Now",
  pendingLabel = "Preparing checkout...",
  closedMessage = "Enrollment is currently closed for this course.",
}: {
  courseId: string;
  courseSlug: string;
  enrollmentOpen: boolean;
  closesAt: string | null;
  closesAtPassedOnServer: boolean;
  label?: string;
  pendingLabel?: string;
  closedMessage?: string;
}) {
  const [closedLive, setClosedLive] = useState(false);

  const closed = !enrollmentOpen || closesAtPassedOnServer || closedLive;

  return (
    <div className="space-y-4">
      {closesAt && !closedLive && !closesAtPassedOnServer && (
        <RegistrationCountdown closesAt={closesAt} onClose={() => setClosedLive(true)} />
      )}

      {closed ? (
        <p className="text-sm text-muted-foreground">{closedMessage}</p>
      ) : (
        <EnrollButton
          courseId={courseId}
          courseSlug={courseSlug}
          label={label}
          pendingLabel={pendingLabel}
        />
      )}
    </div>
  );
}
