import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { getOrCreateOwnCode } from "@/lib/referrals";
import { referralLink } from "@/lib/referral-code";
import { InviteShare } from "@/components/dashboard/invite-share";

export const dynamic = "force-dynamic";

export default async function InviteFriendsPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;
  const name = session!.user.name ?? "Student";

  const code = await getOrCreateOwnCode(userId, name);
  const referred = await prisma.user.findMany({
    where: { referralCodeId: code.id },
    select: { enrollments: { where: { status: { in: ["ACTIVE", "COMPLETED"] } }, select: { id: true }, take: 1 } },
  });
  const joined = referred.length;
  const enrolled = referred.filter((u) => u.enrollments.length > 0).length;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://alfawzacademy.com";
  const link = referralLink(baseUrl, code.code);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold">Invite friends</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Know someone who would benefit from learning with us? Share your personal link. When they register through it, the academy knows you
        brought them.
      </p>

      <Card className="mb-6">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="text-sm text-muted-foreground">Your link</p>
            <p className="mt-1 break-all rounded-md bg-muted px-3 py-2 font-mono text-sm">{link.replace(/^https?:\/\//, "")}</p>
          </div>
          <InviteShare
            link={link}
            message="Assalamu alaikum! I am studying at AlFawz Academy and recommend it. You can register here:"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Friends who joined</p>
            <p className="mt-1 text-3xl font-bold">{joined}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Now enrolled in a course</p>
            <p className="mt-1 text-3xl font-bold">{enrolled}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
