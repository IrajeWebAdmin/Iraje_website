import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/sessionCookie";

// The doorman. Runs before every matched page and turns away visitors who have
// no login cookie at all. It does NOT check the cookie is valid — that needs
// the database and happens in src/lib/dal.js on every protected page. This only
// saves a round trip for people who are obviously logged out.
export function proxy(request) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Admin pages anyone may open without a login cookie: signing in, and the
  // two "forgot password" steps (the emailed link is opened signed out).
  const publicAdminPages = [
    "/admin/login",
    "/admin/forgot-password",
    "/admin/reset-password",
  ];

  if (pathname.startsWith("/admin") && !publicAdminPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (
    pathname.startsWith("/certification/dashboard") ||
    pathname.startsWith("/certification/learn") ||
    pathname ==="/certification/change-password"
  ) {
    return NextResponse.redirect(new URL("/certification/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/certification/dashboard/:path*",
    "/certification/learn/:path*",
    "/certification/change-password",
  ],
};