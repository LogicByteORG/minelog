import { siteHealth } from "@/lib/health";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export function GET() {
  return Response.json(siteHealth(), { headers: NO_STORE });
}
