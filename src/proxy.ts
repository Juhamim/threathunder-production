import { auth } from "@/auth";
import { NextResponse } from "next/server";

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

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
