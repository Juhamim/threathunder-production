import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

function getPublicBaseUrl(req: NextRequest): string {
  const headers = req.headers;
  const proto = headers.get("x-forwarded-proto") || "http";
  const host = headers.get("x-forwarded-host") || headers.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage =
    nextUrl.pathname.startsWith("/sign-in") ||
    nextUrl.pathname.startsWith("/sign-up");

  const isProtected = nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/logs") ||
    nextUrl.pathname.startsWith("/threats") ||
    nextUrl.pathname.startsWith("/reports") ||
    nextUrl.pathname.startsWith("/chat") ||
    nextUrl.pathname.startsWith("/scanner");

  const baseUrl = getPublicBaseUrl(req);

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", baseUrl));
  }

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", baseUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
