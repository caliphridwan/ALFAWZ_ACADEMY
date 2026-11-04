"use client";

import { ReviewButtons } from "@/components/admin/review-buttons";
import { approveBankClaim, rejectBankClaim } from "@/app/admin/bank-transfers/actions";
import { approveScholarship, rejectScholarship } from "@/app/admin/scholarships/actions";

export function BankClaimActions({ claimId, amountMismatch }: { claimId: string; amountMismatch: boolean }) {
  return (
    <ReviewButtons
      approve={() => approveBankClaim(claimId)}
      reject={(reason) => rejectBankClaim(claimId, reason)}
      approveLabel="Approve & enrol"
      confirmApprove={
        amountMismatch
          ? "The amount sent differs from the course price. Approve anyway?"
          : "Confirm you have seen this payment in the bank account?"
      }
    />
  );
}

export function ScholarshipActions({ applicationId }: { applicationId: string }) {
  return (
    <ReviewButtons
      approve={() => approveScholarship(applicationId)}
      reject={(reason) => rejectScholarship(applicationId, reason)}
      approveLabel="Approve scholarship"
      confirmApprove="Enrol this student for free?"
    />
  );
}
