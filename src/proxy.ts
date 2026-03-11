import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Protect all routes except auth pages, API routes, and static files
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/courses/:path*",
    "/custom-review/:path*",
    "/lessons/:path*",
    "/practice/:path*",
    "/speed-test/:path*",
    "/games/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/about/:path*",
    "/admin/:path*",
  ],
};
