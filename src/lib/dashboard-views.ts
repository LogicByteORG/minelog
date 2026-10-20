import type { AlertRow } from "./alerts";
import type { ServerRow } from "./api-keys";
import { formatDate, timeAgo } from "./time";
import type { WebhookRow } from "./webhooks";
import type { WebhookKind } from "./webhook-url";

export type ServerOption = { id: string; name: string };

export type WebhookView = {
  id: string;
  name: string;
  handle: string;
  kind: WebhookKind;
  urlHint: string;
  serverIds: string[] | null;
  scopeText: string;
  enabled: boolean;
  statusText: string;
  statusTone: "ok" | "failed" | "idle" | "paused";
};

export type ServerView = {
  id: string;
  name: string;
  keyPrefix: string;
  detail: string | null;
  seenText: string;
  connected: boolean;
};

function scopeText(serverIds: string[] | null, servers: ServerOption[]): string {
  if (serverIds === null) return "All servers";
  const names = servers.filter((server) => serverIds.includes(server.id)).map((server) => server.name);
  return names.length > 0 ? names.join(", ") : "No servers";
}

export function toWebhookView(
  row: WebhookRow,
  servers: ServerOption[] = [],
  now = new Date(),
): WebhookView {
  const when = row.lastAttemptAt ? timeAgo(row.lastAttemptAt, now) : null;

  let statusText = "Not used yet";
  let statusTone: WebhookView["statusTone"] = "idle";

  if (!row.enabled) {
    statusText = row.lastError ? `Paused. ${row.lastError}` : "Paused";
    statusTone = "paused";
  } else if (row.lastStatus === "ok" && when) {
    statusText = `Delivered ${when}`;
    statusTone = "ok";
  } else if (row.lastStatus === "failed" && when) {
    statusText = `Failed ${when}${row.lastError ? `: ${row.lastError}` : ""}`;
    statusTone = "failed";
  }

  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    kind: row.kind,
    urlHint: row.urlHint,
    serverIds: row.serverIds,
    scopeText: scopeText(row.serverIds, servers),
    enabled: row.enabled,
    statusText,
    statusTone,
  };
}

export function toServerView(row: ServerRow, now = new Date()): ServerView {
  const software = [row.software, row.softwareVersion].filter(Boolean).join(" ");
  const detail = [
    software === row.name ? "" : software,
    row.pluginVersion ? `plugin ${row.pluginVersion}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    id: row.id,
    name: row.name,
    keyPrefix: row.keyPrefix,
    detail: detail || null,
    seenText: row.lastSeenAt ? `Seen ${timeAgo(row.lastSeenAt, now)}` : "Never connected",
    connected: row.lastSeenAt !== null,
  };
}

export type AlertView = {
  id: string;
  summary: string;
  occurrences: number;
  lastSeenText: string;
  expiresText: string;
};

export type AlertGroup = {
  serverId: string;
  serverName: string;
  alerts: AlertView[];
};

export function groupAlerts(rows: AlertRow[], now = new Date()): AlertGroup[] {
  const groups = new Map<string, AlertGroup>();
  for (const row of rows) {
    let group = groups.get(row.serverId);
    if (!group) {
      group = { serverId: row.serverId, serverName: row.serverName, alerts: [] };
      groups.set(row.serverId, group);
    }
    group.alerts.push({
      id: row.id,
      summary: row.summary,
      occurrences: row.occurrences,
      lastSeenText: timeAgo(row.lastSeenAt, now),
      expiresText: formatDate(row.expiresAt),
    });
  }
  return [...groups.values()];
}
