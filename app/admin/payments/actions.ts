"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sendPendingPaymentReminders, type PaymentReminderResult } from "@/lib/payment-reminders";

export type SendRemindersState = {
  result?: PaymentReminderResult;
  error?: string;
};

/**
 * Manual trigger for admins who don't want to wait for the scheduled cron
 * run (see render.yaml + app/api/cron/payment-reminders) — goes through the
 * same throttled sendPendingPaymentReminders function, so running this
 * right after the cron job fired just finds nothing new to send.
 */
export async function sendPaymentRemindersNow(
  _prev: SendRemindersState
): Promise<SendRemindersState> {
  await requireAdmin();

  try {
    const result = await sendPendingPaymentReminders();
    revalidatePath("/admin/payments");
    return { result };
  } catch (err) {
    console.error("Manual payment reminder run failed:", err);
    return { error: "Something went wrong sending reminders. Please try again." };
  }
}
