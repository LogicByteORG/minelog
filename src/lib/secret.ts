import { timingSafeEqual } from "node:crypto";

export function bearerMatches(request: Request, secret: string | undefined): boolean {
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
