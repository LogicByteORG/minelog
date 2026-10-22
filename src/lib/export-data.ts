import type { AlertDetail } from "./alerts";
import type { ServerRow } from "./api-keys";
import type { LinkedAccount, OwnedLog } from "./dashboard";
import type { WebhookRow } from "./webhooks";
import { KIND_LABEL } from "./webhook-url";

export type ExportInput = {
  user: { name: string; email: string; createdAt: Date };
  linked: LinkedAccount[];
  logs: OwnedLog[];
  servers: ServerRow[];
  webhooks: WebhookRow[];
  alerts: AlertDetail[];
  base: string;
  now: Date;
};

function webhookServers(serverIds: string[] | null, servers: ServerRow[]): string[] | "all" {
  if (serverIds === null) return "all";
  return servers.filter((server) => serverIds.includes(server.id)).map((server) => server.name);
}

export function exportDocument(input: ExportInput) {
  const { user, linked, logs, servers, webhooks, alerts, base, now } = input;

  return {
    note: "Everything minelog holds for this account. Webhook addresses, server keys and login tokens are never included, they can't be read back.",
    exportedAt: now,
    account: {
      name: user.name,
      email: user.email,
      memberSince: user.createdAt,
      connectedAccounts: linked.map((item) => ({
        provider: item.provider.label,
        connectedAt: item.connectedAt,
      })),
    },
    logs: logs.map((log) => ({
      id: log.id,
      url: `${base}${log.isPrivate ? "/p/" : "/"}${log.id}`,
      private: log.isPrivate,
      type: log.typeLabel,
      lines: log.lineCount,
      errors: log.errorCount,
      warnings: log.warnCount,
      savedAt: log.createdAt,
      expiresAt: log.expiresAt,
    })),
    servers: servers.map((server) => ({
      name: server.name,
      software: server.software,
      softwareVersion: server.softwareVersion,
      pluginVersion: server.pluginVersion,
      createdAt: server.createdAt,
      lastSeenAt: server.lastSeenAt,
    })),
    webhooks: webhooks.map((hook) => ({
      name: hook.name,
      handle: hook.handle,
      platform: KIND_LABEL[hook.kind],
      addressHint: hook.urlHint,
      servers: webhookServers(hook.serverIds, servers),
      enabled: hook.enabled,
      lastStatus: hook.lastStatus,
      lastAttemptAt: hook.lastAttemptAt,
      createdAt: hook.createdAt,
    })),
    alerts: alerts.map((alert) => ({
      server: alert.serverName,
      summary: alert.summary,
      occurrences: alert.occurrences,
      firstSeenAt: alert.firstSeenAt,
      lastSeenAt: alert.lastSeenAt,
      expiresAt: alert.expiresAt,
      logLines: alert.content,
    })),
  };
}
