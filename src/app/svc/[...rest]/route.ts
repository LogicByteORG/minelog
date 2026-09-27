import type { NextRequest } from "next/server";
import { compatError, preflight, v2Error } from "@/lib/service/respond";

const isCompat = (path: string) => /^(\/svc)?\/1(\/|$)/.test(path);

const notFound = (request: NextRequest) =>
  isCompat(request.nextUrl.pathname)
    ? compatError(404, "There is no endpoint at this address.")
    : v2Error(404, "not_found", "There is no endpoint at this address.");

export const OPTIONS = preflight;
export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;

