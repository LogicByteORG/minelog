import { timingSafeEqual } from "node:crypto";
import { toggleHeartbeat } from "@/lib/heartbeat";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function isCron(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  if (!isCron(request)) return new Response(null, { status: 404, headers: NO_STORE });
  await toggleHeartbeat();
  return new Response(null, { status: 204, headers: NO_STORE });
}
