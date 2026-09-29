import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Section 59: role-based access control at the edge. This is a second
 * layer — every server action/API route that touches sensitive data must
 * ALSO check the session itself, since middleware alone is not sufficient
 * authorization for mutations (Section 54: "never trust client-side
 * authorization").
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (pathname.startsWith("/admin") && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/dashboard") && role !== "STUDENT") {
      // Sponsors and admins have their own areas; students only in /dashboard.
      if (role === "SPONSOR") {
        return NextResponse.redirect(new URL("/sponsor/dashboard", req.url));
      }
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    if (pathname.startsWith("/sponsor/dashboard") && role !== "SPONSOR") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
    secret: process.env.AUTH_SECRET,
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/sponsor/dashboard/:path*"],
};
