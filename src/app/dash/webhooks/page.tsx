import type { Metadata } from "next";
import { WebhooksManager } from "@/components/dashboard/webhooks-manager";
import { listServers } from "@/lib/api-keys";
import { WEBHOOKS_PER_ACCOUNT } from "@/lib/config";
import { toWebhookView } from "@/lib/dashboard-views";
import { requireSession } from "@/lib/session";
import { listWebhooks } from "@/lib/webhooks";

export const metadata: Metadata = { title: "Webhooks" };

export default async function WebhooksPage() {
  const { user } = await requireSession();
  const now = new Date();
  const [rows, serverRows] = await Promise.all([listWebhooks(user.id), listServers(user.id)]);
  const servers = serverRows.map((server) => ({ id: server.id, name: server.name }));
  const hooks = rows.map((row) => toWebhookView(row, servers, now));

  return <WebhooksManager hooks={hooks} servers={servers} limit={WEBHOOKS_PER_ACCOUNT} />;
}
