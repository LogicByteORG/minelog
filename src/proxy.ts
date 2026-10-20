import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_PREFIX } from "@/lib/auth-config";
import { LOGIN_PATH } from "@/lib/auth-providers";

export function proxy(request: NextRequest) {
  const cookie = getSessionCookie(request, { cookiePrefix: COOKIE_PREFIX });
  if (cookie) return NextResponse.next();
  return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
}

export const config = {
  matcher: ["/dash", "/dash/:path*"],
};
