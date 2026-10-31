import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_PREFIX } from "@/lib/auth-config";
import { LOGIN_PATH } from "@/lib/auth-providers";
import { slugForHost } from "@/lib/custom-domains";
import { isOwnHost } from "@/lib/domain-settings";
import { isValidId } from "@/lib/ids";

const SINGLE_SEGMENT = /^\/([A-Za-z0-9]+)$/;
const LOG_TEXT = /^\/api\/log\/[A-Za-z0-9]+$/;

function hostOf(address: string | undefined): string[] {
  try {
    return address ? [new URL(address).hostname] : [];
  } catch {
    return [];
  }
}

const OWN_HOSTS = [...hostOf(process.env.SITE_URL), ...hostOf(process.env.API_URL)];

function rewriteTo(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  return NextResponse.rewrite(url);
}

async function serveCustomDomain(request: NextRequest, host: string) {
  const slug = await slugForHost(host);
  if (!slug) return new NextResponse("Not found", { status: 404 });

  const { pathname } = request.nextUrl;
  if (pathname === "/") return rewriteTo(request, `/c/${slug}`);

  const single = SINGLE_SEGMENT.exec(pathname);
  if (single && isValidId(single[1])) return rewriteTo(request, `/c/${slug}/${single[1]}`);

  if (request.method === "GET" && LOG_TEXT.test(pathname)) return NextResponse.next();

  return rewriteTo(request, `/c/${slug}/missing`);
}

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  if (host && !isOwnHost(host, OWN_HOSTS)) return serveCustomDomain(request, host);

  if (!request.nextUrl.pathname.startsWith("/dash")) return NextResponse.next();
  const cookie = getSessionCookie(request, { cookiePrefix: COOKIE_PREFIX });
  if (cookie) return NextResponse.next();
  return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
