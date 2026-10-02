import { coverageSnapshot } from "@/lib/diagnose/coverage";
import { bearerMatches } from "@/lib/secret";

const NO_STORE = { "Cache-Control": "no-store" };

export function GET(request: Request) {
  if (!bearerMatches(request, process.env.CRON_SECRET)) {
    return new Response(null, { status: 404, headers: NO_STORE });
  }
  return Response.json(coverageSnapshot(), { headers: NO_STORE });
}
