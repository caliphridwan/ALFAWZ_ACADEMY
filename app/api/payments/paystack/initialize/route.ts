import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { enrollmentInitSchema } from "@/lib/validations/schemas";
import { initializeTransaction, nairaToKobo, generateReference } from "@/lib/paystack/client";

/**
 * Section 15, steps 1-6: student selects a course → we verify auth →
 * create a PENDING enrollment + PENDING payment row → ask Paystack for a
 * checkout URL. The amount charged always comes from the Course record in
 * our own database, never from anything the client sends — this is what
 * prevents amount tampering (Section 41/72).
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in to enrol." }, { status: 401 });
  }
  if (session.user.role !== "STUDENT") {
    return NextResponse.json(
      { error: "Only student accounts can enrol in courses." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = enrollmentInitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } });
  if (!course || !course.active || !course.enrollmentOpen) {
    return NextResponse.json(
      { error: "This course is not currently open for enrollment." },
      { status: 404 }
    );
  }

  const existingActive = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session.user.id, courseId: course.id } },
  });
  if (existingActive?.status === "ACTIVE") {
    return NextResponse.json({ error: "You are already enrolled in this course." }, { status: 409 });
  }

  const reference = generateReference("CRS");
  const amountNaira = Number(course.price);

  const result = await prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.upsert({
      where: { studentId_courseId: { studentId: session.user.id, courseId: course.id } },
      update: { status: "PENDING" },
      create: { studentId: session.user.id, courseId: course.id, status: "PENDING" },
    });

    const payment = await tx.payment.create({
      data: {
        userId: session.user.id,
        type: "COURSE",
        amount: amountNaira,
        currency: course.currency,
        reference,
        status: "PENDING",
        courseId: course.id,
        metadata: { enrollmentId: enrollment.id },
      },
    });

    return { enrollment, payment };
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  try {
    const paystackRes = await initializeTransaction({
      email: session.user.email!,
      amountKobo: nairaToKobo(amountNaira),
      reference,
      callbackUrl: `${appUrl}/dashboard/payments/callback`,
      metadata: {
        type: "COURSE",
        courseId: course.id,
        enrollmentId: result.enrollment.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      authorizationUrl: paystackRes.data.authorization_url,
      reference,
    });
  } catch (err) {
    console.error("Paystack initialize error:", err);
    // Roll the payment back to FAILED so it doesn't sit as a phantom PENDING row.
    await prisma.payment.update({ where: { reference }, data: { status: "FAILED" } });
    return NextResponse.json(
      { error: "We couldn't start the payment. Please try again shortly." },
      { status: 502 }
    );
  }
}
