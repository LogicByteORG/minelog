import { listAlertDetails } from "@/lib/alerts";
import { listServers } from "@/lib/api-keys";
import { EXPORTS_PER_MINUTE } from "@/lib/config";
import { linkedAccounts, ownedLogs } from "@/lib/dashboard";
import { exportDocument } from "@/lib/export-data";
import { takeHit } from "@/lib/service/limiter";
import { getSession } from "@/lib/session";
import { pageBase } from "@/lib/site";
import { listWebhooks } from "@/lib/webhooks";

const NO_STORE = { "Cache-Control": "no-store" };
const LOG_LIMIT = 50_000;

export async function GET() {
  const session = await getSession();
  if (!session) return new Response(null, { status: 401, headers: NO_STORE });

  const { user } = session;
  const hit = takeHit(`export:${user.id}`, EXPORTS_PER_MINUTE);
  if (!hit.ok) {
    return new Response("Too many exports. Wait a moment and try again.", {
      status: 429,
      headers: { ...NO_STORE, "Retry-After": String(hit.retryAfter) },
    });
  }

  const [linked, logs, servers, webhooks, alerts] = await Promise.all([
    linkedAccounts(),
    ownedLogs(user.id, LOG_LIMIT),
    listServers(user.id),
    listWebhooks(user.id),
    listAlertDetails(user.id),
  ]);

  const now = new Date();
  const body = exportDocument({
    user: { name: user.name, email: user.email, createdAt: new Date(user.createdAt) },
    linked,
    logs,
    servers,
    webhooks,
    alerts,
    base: pageBase(),
    now,
  });

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      ...NO_STORE,
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="minelog-data-${now.toISOString().slice(0, 10)}.json"`,
    },
  });
}
