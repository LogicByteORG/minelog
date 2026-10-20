import type { EventLevel } from "./webhook-events";
import type { WebhookKind } from "./webhook-url";

export type EventField = { name: string; value: string };

export type OutgoingEvent = {
  event: string;
  level: EventLevel;
  title: string;
  message: string;
  fields: EventField[];
  occurredAt: Date;
  serverName: string;
};

const DISCORD_COLOR: Record<EventLevel, number> = {
  error: 0xe5484d,
  warning: 0xf5a524,
  info: 0x8e97a4,
};

const SLACK_COLOR: Record<EventLevel, string> = {
  error: "#e5484d",
  warning: "#f5a524",
  info: "#8e97a4",
};

export const FIELD_NAME_MAX = 40;

export const FIELD_VALUE_MAX = 200;

export const FIELDS_MAX = 10;

export const TITLE_MAX = 120;

export const MESSAGE_MAX = 1500;

function slackSafe(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const TEAMS_COLOR: Record<EventLevel, string> = {
  error: "Attention",
  warning: "Warning",
  info: "Default",
};

function htmlSafe(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function plainLines(
  event: OutgoingEvent,
  bold: (text: string) => string,
  italic: (text: string) => string,
): string {
  const lines = [bold(event.title)];
  if (event.message) lines.push(event.message);
  for (const field of event.fields)
    lines.push(`${bold(`${field.name}:`)} ${field.value}`);
  lines.push(italic(`${event.serverName} · minelog`));
  return lines.join("\n");
}

// Telegram wants the chat in the body, not in the address we show people.
export function prepareRequest(
  kind: WebhookKind,
  url: string,
  payload: unknown,
): { url: string; payload: unknown } {
  if (kind !== "telegram") return { url, payload };
  const parsed = new URL(url);
  const chat = parsed.searchParams.get("chat_id");
  parsed.searchParams.delete("chat_id");
  return {
    url: parsed.toString(),
    payload: { ...(payload as object), chat_id: chat },
  };
}

export function buildPayload(kind: WebhookKind, event: OutgoingEvent): unknown {
  if (kind === "discord" || kind === "guilded") {
    return {
      embeds: [
        {
          title: event.title,
          ...(event.message ? { description: event.message } : {}),
          color: DISCORD_COLOR[event.level],
          fields: event.fields.map((field) => ({
            name: field.name,
            value: field.value,
            inline: true,
          })),
          footer: { text: `${event.serverName} · minelog` },
          timestamp: event.occurredAt.toISOString(),
        },
      ],
    };
  }

  if (kind === "slack") {
    return {
      text: slackSafe(`${event.title} (${event.serverName})`),
      attachments: [
        {
          color: SLACK_COLOR[event.level],
          title: slackSafe(event.title),
          ...(event.message ? { text: slackSafe(event.message) } : {}),
          fields: event.fields.map((field) => ({
            title: slackSafe(field.name),
            value: slackSafe(field.value),
            short: true,
          })),
          footer: slackSafe(`${event.serverName} · minelog`),
          ts: Math.floor(event.occurredAt.getTime() / 1000),
        },
      ],
    };
  }

  if (kind === "mattermost") {
    return {
      attachments: [
        {
          fallback: `${event.title} (${event.serverName})`,
          color: SLACK_COLOR[event.level],
          title: event.title,
          ...(event.message ? { text: event.message } : {}),
          fields: event.fields.map((field) => ({
            title: field.name,
            value: field.value,
            short: true,
          })),
          footer: `${event.serverName} · minelog`,
        },
      ],
    };
  }

  if (kind === "teams") {
    return {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          contentUrl: null,
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.2",
            body: [
              {
                type: "TextBlock",
                text: event.title,
                weight: "Bolder",
                size: "Medium",
                wrap: true,
                color: TEAMS_COLOR[event.level],
              },
              ...(event.message
                ? [{ type: "TextBlock", text: event.message, wrap: true }]
                : []),
              ...(event.fields.length > 0
                ? [
                    {
                      type: "FactSet",
                      facts: event.fields.map((field) => ({
                        title: field.name,
                        value: field.value,
                      })),
                    },
                  ]
                : []),
              {
                type: "TextBlock",
                text: `${event.serverName} · minelog`,
                isSubtle: true,
                size: "Small",
                wrap: true,
              },
            ],
          },
        },
      ],
    };
  }

  if (kind === "googlechat") {
    return {
      text: plainLines(
        event,
        (text) => `*${text}*`,
        (text) => `_${text}_`,
      ),
    };
  }

  if (kind === "telegram") {
    return {
      text: plainLines(
        {
          ...event,
          title: htmlSafe(event.title),
          message: htmlSafe(event.message),
          serverName: htmlSafe(event.serverName),
          fields: event.fields.map((field) => ({
            name: htmlSafe(field.name),
            value: htmlSafe(field.value),
          })),
        },
        (text) => `<b>${text}</b>`,
        (text) => `<i>${text}</i>`,
      ),
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    };
  }

  return {
    source: "minelog",
    event: event.event,
    level: event.level,
    title: event.title,
    message: event.message,
    fields: Object.fromEntries(
      event.fields.map((field) => [field.name, field.value]),
    ),
    server: { name: event.serverName },
    occurredAt: event.occurredAt.toISOString(),
  };
}
