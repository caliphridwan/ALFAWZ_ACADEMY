import "server-only";
import { prisma } from "@/lib/db/prisma";

export type BankTransferInfo = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  note: string | null;
  whatsappNumber: string | null;
  contactEmail: string | null;
};

/**
 * Returns the admin-configured bank-transfer details, or null when they
 * aren't set (the UI then shows nothing). Never throws — a settings lookup
 * failure must not break a payment page.
 */
export async function getBankTransferInfo(): Promise<BankTransferInfo | null> {
  try {
    const s = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!s?.bankName || !s.bankAccountNumber || !s.bankAccountName) return null;
    return {
      bankName: s.bankName,
      accountName: s.bankAccountName,
      accountNumber: s.bankAccountNumber,
      note: s.bankTransferNote,
      whatsappNumber: s.whatsappNumber,
      contactEmail: s.contactEmail,
    };
  } catch (err) {
    console.error("Failed to load bank transfer details:", err);
    return null;
  }
}
