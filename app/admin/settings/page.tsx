import { prisma } from "@/lib/db/prisma";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>
      <SettingsForm
        defaults={{
          sponsorshipPrice: Number(settings?.sponsorshipPrice ?? 30000),
          currency: settings?.currency ?? "NGN",
          currencySymbol: settings?.currencySymbol ?? "₦",
          minSponsorStudents: settings?.minSponsorStudents ?? 1,
          maxSponsorStudents: settings?.maxSponsorStudents ?? 100,
          whatsappNumber: settings?.whatsappNumber,
          contactEmail: settings?.contactEmail,
          phoneNumber: settings?.phoneNumber,
          logoUrl: settings?.logoUrl,
          heroImageUrl: settings?.heroImageUrl,
        }}
      />
    </div>
  );
}
