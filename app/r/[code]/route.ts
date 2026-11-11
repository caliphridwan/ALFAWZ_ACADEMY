import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { REFERRAL_COOKIE, REFERRAL_COOKIE_DAYS, normalizeCode, safeRedirectPath } from "@/lib/referral-code";

export const dynamic = "force-dynamic";

/**
 * A shareable link: /r/CODE. Remembers which code brought the visitor (for 30
 * days) and sends them on to sign up, so a later registration is credited to it.
 * Unknown or switched-off codes just continue to the page without tracking.
 */
export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const dest = safeRedirectPath(req.nextUrl.searchParams.get("to"));
  const res = NextResponse.redirect(new URL(dest, req.url));

  const code = normalizeCode(params.code);
  if (!code) return res;

  try {
    const row = await prisma.referralCode.findUnique({ where: { code }, select: { id: true, active: true } });
    if (!row || !row.active) return res;

    // Count a visit once per browser, not on every refresh.
    if (req.cookies.get(REFERRAL_COOKIE)?.value !== code) {
      await prisma.referralCode.update({ where: { id: row.id }, data: { clicks: { increment: 1 } } });
    }
    res.cookies.set(REFERRAL_COOKIE, code, {
      maxAge: REFERRAL_COOKIE_DAYS * 24 * 60 * 60,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  } catch (err) {
    console.error("Referral link failed:", err);
  }
  return res;
}
