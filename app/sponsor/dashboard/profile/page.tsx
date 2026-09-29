import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { ProfileForm, PasswordForm } from "@/app/dashboard/profile/profile-forms";

export default async function SponsorProfilePage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });
  if (!user) return null;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <ProfileForm
        defaultValues={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          country: user.country,
          address: user.address,
        }}
      />
      <PasswordForm />
    </div>
  );
}
