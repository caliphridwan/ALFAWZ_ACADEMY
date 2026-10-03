import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with AlFawz Academy — questions about courses, enrollment or sponsorship.",
};

export default async function ContactPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  return (
    <div className="container py-16 grid lg:grid-cols-2 gap-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground mb-8">
          Whether you're interested in enrolling, sponsoring a student, joining our alumni network, or learning more about our programmes, our team would be happy to assist you.
        </p>

        <div className="space-y-4 text-sm">
          {settings?.contactEmail && (
            <p className="flex items-center gap-3">
              <Mail size={18} className="text-brand" /> {settings.contactEmail}
            </p>
          )}
          {settings?.phoneNumber && (
            <p className="flex items-center gap-3">
              <Phone size={18} className="text-brand" /> {settings.phoneNumber}
            </p>
          )}
          {settings?.whatsappNumber && (
            <p className="flex items-center gap-3">
              <MapPin size={18} className="text-brand" /> WhatsApp: {settings.whatsappNumber}
            </p>
          )}
        </div>
      </div>

      <ContactForm />
    </div>
  );
}
