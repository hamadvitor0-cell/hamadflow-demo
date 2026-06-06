import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(sessionCookieName)?.value);

  if (request.nextUrl.pathname.startsWith("/dashboard") && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
