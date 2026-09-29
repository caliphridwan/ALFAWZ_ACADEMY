import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { ProfileForm, PasswordForm } from "./profile-forms";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: { guardian: true },
  });

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-6">
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
      {user.guardian && (
        <div className="rounded-lg border border-border bg-muted/30 p-6 text-sm">
          <h2 className="font-semibold mb-2">Guardian on file</h2>
          <p className="text-muted-foreground">
            {user.guardian.name} ({user.guardian.relationship}) — {user.guardian.email}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            To update guardian details, please contact support for verification.
          </p>
        </div>
      )}
      <PasswordForm />
    </div>
  );
}
