"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { siteSettingsSchema } from "@/lib/validations/schemas";

export type SettingsFormState = {
  success: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

/**
 * Section 29/64: this is the ONLY place sponsorship price/currency/WhatsApp
 * number etc. can be changed. Every place that reads them (the sponsorship
 * calculator, the WhatsApp button, the /api/sponsorship/initialize route)
 * reads from this same SiteSettings row, so a change here takes effect
 * everywhere immediately.
 */
export async function updateSiteSettings(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();

  const parsed = siteSettingsSchema.safeParse({
    sponsorshipPrice: formData.get("sponsorshipPrice"),
    currency: formData.get("currency"),
    currencySymbol: formData.get("currencySymbol"),
    minSponsorStudents: formData.get("minSponsorStudents"),
    maxSponsorStudents: formData.get("maxSponsorStudents"),
    whatsappNumber: formData.get("whatsappNumber") || undefined,
    contactEmail: formData.get("contactEmail") || undefined,
    phoneNumber: formData.get("phoneNumber") || undefined,
    logoUrl: formData.get("logoUrl") || "",
    heroImageUrl: formData.get("heroImageUrl") || "",
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as any };
  }

  const data = {
    ...parsed.data,
    logoUrl: parsed.data.logoUrl || null,
    heroImageUrl: parsed.data.heroImageUrl || null,
  };

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/sponsor");
  revalidatePath("/sponsors");
  revalidatePath("/", "layout"); // logo lives in the root layout, hero image on "/"
  return { success: true };
}
