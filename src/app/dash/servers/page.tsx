import type { Metadata } from "next";
import { ServersManager } from "@/components/dashboard/servers-manager";
import { listServers } from "@/lib/api-keys";
import { SERVERS_PER_ACCOUNT } from "@/lib/config";
import { toServerView } from "@/lib/dashboard-views";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Servers" };

export default async function ServersPage() {
  const { user } = await requireSession();
  const now = new Date();
  const servers = (await listServers(user.id)).map((row) => toServerView(row, now));

  return <ServersManager servers={servers} limit={SERVERS_PER_ACCOUNT} />;
}
