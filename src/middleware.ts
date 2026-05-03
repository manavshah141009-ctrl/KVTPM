import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes, but ignore the login page itself
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get("kvtp_admin")?.value;

    if (!session) {
      // No cookie? Redirect to login
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin/:path*"],
};
