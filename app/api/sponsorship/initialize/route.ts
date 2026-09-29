import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { sponsorshipCreateSchema } from "@/lib/validations/schemas";
import { initializeTransaction, nairaToKobo, generateReference } from "@/lib/paystack/client";

/**
 * Section 17-19: the sponsorship price-per-student and min/max bounds come
 * from SiteSettings (admin-editable), never from the request body — this is
 * what lets an admin change ₦30,000 → ₦35,000 and have it apply immediately
 * and consistently, and stops a client from sending a fabricated total.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = sponsorshipCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    return NextResponse.json({ error: "Site is not configured yet." }, { status: 500 });
  }

  if (
    data.numberOfStudents < settings.minSponsorStudents ||
    data.numberOfStudents > settings.maxSponsorStudents
  ) {
    return NextResponse.json(
      {
        error: `You can sponsor between ${settings.minSponsorStudents} and ${settings.maxSponsorStudents} students.`,
      },
      { status: 400 }
    );
  }

  const amountPerStudent = Number(settings.sponsorshipPrice);
  const totalAmount = amountPerStudent * data.numberOfStudents;

  // Sponsors may or may not already have an account. If the email matches an
  // existing user we attach to it; otherwise we create a lightweight
  // SPONSOR-role account so they can access /sponsor/dashboard later.
  let sponsor = await prisma.user.findUnique({ where: { email: data.email } });
  if (!sponsor) {
    sponsor = await prisma.user.create({
      data: {
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        role: "SPONSOR",
        // No password set yet — sponsor can set one via "forgot password"
        // if they want dashboard access later.
      },
    });
  }

  const reference = generateReference("SPN");

  const result = await prisma.$transaction(async (tx) => {
    const sponsorship = await tx.sponsorship.create({
      data: {
        sponsorId: sponsor!.id,
        numberOfStudents: data.numberOfStudents,
        amountPerStudent,
        totalAmount,
        currency: settings.currency,
        duration: data.duration,
        status: "PENDING",
        showPublicly: data.showPublicly,
        publicName: data.showPublicly ? (data.publicName || data.fullName) : null,
        message: data.message,
      },
    });

    const payment = await tx.payment.create({
      data: {
        userId: sponsor!.id,
        type: "SPONSORSHIP",
        amount: totalAmount,
        currency: settings.currency,
        reference,
        status: "PENDING",
        sponsorshipId: sponsorship.id,
      },
    });

    return { sponsorship, payment };
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  try {
    const paystackRes = await initializeTransaction({
      email: sponsor.email,
      amountKobo: nairaToKobo(totalAmount),
      reference,
      callbackUrl: `${appUrl}/sponsor/callback`,
      metadata: {
        type: "SPONSORSHIP",
        sponsorshipId: result.sponsorship.id,
        sponsorId: sponsor.id,
      },
    });

    return NextResponse.json({ authorizationUrl: paystackRes.data.authorization_url, reference });
  } catch (err) {
    console.error("Paystack sponsorship initialize error:", err);
    await prisma.payment.update({ where: { reference }, data: { status: "FAILED" } });
    return NextResponse.json(
      { error: "We couldn't start the payment. Please try again shortly." },
      { status: 502 }
    );
  }
}
