import { toggleHeartbeat } from "@/lib/heartbeat";
import { bearerMatches } from "@/lib/secret";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  if (!bearerMatches(request, process.env.CRON_SECRET)) {
    return new Response(null, { status: 404, headers: NO_STORE });
  }
  await toggleHeartbeat();
  return new Response(null, { status: 204, headers: NO_STORE });
}
