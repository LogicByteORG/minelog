import { apiHealthFromCheck, checkDatabase } from "@/lib/health";
import { json, preflight } from "@/lib/service/respond";

export const dynamic = "force-dynamic";

export const OPTIONS = preflight;

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const body = apiHealthFromCheck(await checkDatabase());
  return json(body, body.status === "ok" ? 200 : 503, NO_STORE);
}
