"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function setSponsorshipPublicDisplay(
  sponsorshipId: string,
  showPublicly: boolean,
  publicName?: string
) {
  await requireAdmin();

  await prisma.sponsorship.update({
    where: { id: sponsorshipId },
    data: { showPublicly, ...(publicName !== undefined ? { publicName } : {}) },
  });

  revalidatePath("/admin/sponsors");
  revalidatePath("/sponsors");
}

export async function setSponsorshipStatus(
  sponsorshipId: string,
  status: "ACTIVE" | "CANCELLED" | "EXPIRED"
) {
  await requireAdmin();

  await prisma.sponsorship.update({ where: { id: sponsorshipId }, data: { status } });

  revalidatePath("/admin/sponsors");
  revalidatePath("/sponsors");
}
