import { BodyError } from "./body";
import { DeleteError } from "./delete";
import { UploadError } from "./upload";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Content-Encoding, X-Minelog-Client, Authorization",
  "Access-Control-Expose-Headers": "Retry-After",
  "Access-Control-Max-Age": "86400",
};

function withCors(extra?: HeadersInit): Headers {
  const headers = new Headers(CORS);
  new Headers(extra).forEach((value, key) => headers.set(key, value));
  return headers;
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: withCors() });
}

export function json(body: unknown, status = 200, extra?: HeadersInit): Response {
  const headers = withCors(extra);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers });
}

export const BRIEF_CACHE = { "Cache-Control": "public, max-age=60" };

export function plainText(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: withCors({
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "public, max-age=60",
    }),
  });
}

export function v2Error(
  status: number,
  code: string,
  message: string,
  extra?: HeadersInit,
): Response {
  return json({ error: { code, message } }, status, extra);
}

export const v2NotFound = () =>
  v2Error(404, "not_found", "This log doesn't exist or has expired.");

function retryHeader(error: { retryAfter?: number }): HeadersInit | undefined {
  return error.retryAfter ? { "Retry-After": String(error.retryAfter) } : undefined;
}

export function v2Failure(error: unknown): Response {
  if (error instanceof DeleteError) {
    return v2Error(error.status, error.code, error.message, retryHeader(error));
  }
  if (error instanceof UploadError) {
    return v2Error(error.status, error.code, error.message, retryHeader(error));
  }
  if (error instanceof BodyError) {
    return error.problem === "too_large"
      ? v2Error(413, "log_too_large", "This log is too large.")
      : v2Error(400, "invalid_body", "The request body isn't valid gzip.");
  }
  throw error;
}

export function compatError(
  status: number,
  message: string,
  extra?: HeadersInit,
): Response {
  return json({ success: false, error: message }, status, extra);
}

export const compatNotFound = () => compatError(404, "This log doesn't exist or has expired.");

export function compatFailure(error: unknown): Response {
  if (error instanceof DeleteError) {
    return compatError(error.status, error.message, retryHeader(error));
  }
  if (error instanceof UploadError) {
    return compatError(error.status, error.message, retryHeader(error));
  }
  if (error instanceof BodyError) {
    return error.problem === "too_large"
      ? compatError(413, "This log is too large.")
      : compatError(400, "The request body isn't valid gzip.");
  }
  throw error;
}

