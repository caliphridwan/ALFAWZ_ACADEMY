"use server";

import { prisma } from "@/lib/db/prisma";
import { contactSchema } from "@/lib/validations/schemas";
import { sendContactNotificationToAdmin } from "@/lib/email/send";

export type ContactFormState = {
  success: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

export async function submitContactMessage(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as any };
  }

  await prisma.contactMessage.create({ data: parsed.data });

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (settings?.contactEmail) {
    await sendContactNotificationToAdmin({
      adminEmail: settings.contactEmail,
      ...parsed.data,
    }).catch((err) => console.error("Contact notification email failed:", err));
  }

  return { success: true };
}
