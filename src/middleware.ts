import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isProtectedPage =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/admin");

  if (isAuthPage) {
    if (token) {
      // Do not redirect verified users away from the newly requested verify route by default, but let them hit it if they desire (for resend flows, although they should skip it).
      // Actually strictly prevent unverified accounts from leaving /auth/verify, and pull verified users out.
      const isVerifyRoute = request.nextUrl.pathname.startsWith("/auth/verify");

      if (token.role === "STUDENT" && !token.emailVerified) {
        if (!isVerifyRoute) {
          return NextResponse.redirect(new URL("/auth/verify", request.url));
        }
        return NextResponse.next();
      }

      if (isVerifyRoute && token.emailVerified) {
        return NextResponse.redirect(new URL("/dashboard", request.url)); // Move validated students out
      }

      // Keep everyone else routing to dashboard if they hit /auth
      if (!isVerifyRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  if (isProtectedPage) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Students must verify their email
    if (token.role === "STUDENT" && !token.emailVerified) {
      return NextResponse.redirect(new URL("/auth/verify", request.url));
    }
  }

  const isAdminRoute = request.nextUrl.pathname.startsWith("/dashboard/admin");
  if (isAdminRoute && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/sessions/:path*",
    "/attendance/:path*",
    "/notes/:path*",
  ],
};
