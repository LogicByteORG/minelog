export type WebhookKind =
  | "discord"
  | "slack"
  | "teams"
  | "googlechat"
  | "telegram"
  | "guilded"
  | "mattermost"
  | "custom";

export type DetectedWebhook =
  | { ok: true; kind: WebhookKind; url: string; hint: string }
  | { ok: false; error: string };

export const MAX_WEBHOOK_URL_LENGTH = 2000;

export const KIND_LABEL: Record<WebhookKind, string> = {
  discord: "Discord",
  slack: "Slack",
  teams: "Microsoft Teams",
  googlechat: "Google Chat",
  telegram: "Telegram",
  guilded: "Guilded",
  mattermost: "Mattermost",
  custom: "Custom",
};

const DISCORD_HOSTS = new Set([
  "discord.com",
  "discordapp.com",
  "ptb.discord.com",
  "canary.discord.com",
]);

const DISCORD_PATH = /^\/api\/(?:v\d+\/)?webhooks\/\d+\/[\w-]+\/?$/;

const SLACK_HOST = "hooks.slack.com";

const SLACK_PATH = /^\/(?:services|workflows|triggers)\/[\w/-]+$/;

const TEAMS_HOSTS = [".logic.azure.com", ".webhook.office.com", ".powerplatform.com"];

const GOOGLE_CHAT_HOST = "chat.googleapis.com";

const GOOGLE_CHAT_PATH = /^\/v1\/spaces\/[\w-]+\/messages$/;

const TELEGRAM_HOST = "api.telegram.org";

const TELEGRAM_PATH = /^\/bot(\d+):[\w-]+\/sendMessage$/;

const GUILDED_HOST = "media.guilded.gg";

const GUILDED_PATH = /^\/webhooks\/[0-9a-fA-F-]{36}\/[\w-]+$/;

const MATTERMOST_PATH = /^\/hooks\/[a-z0-9]{26}$/;

function looksInternal(host: string): boolean {
  if (host.includes(":") || host.startsWith("[")) return true;
  if (/^\d+(?:\.\d+){3}$/.test(host)) return true;
  if (!host.includes(".")) return true;
  return /\.(?:local|localhost|internal|lan|home|corp|intranet)$/.test(host);
}

function hintFor(kind: WebhookKind, url: URL): string {
  const host = url.hostname.toLowerCase();
  if (kind === "discord") {
    const id = url.pathname.split("/").filter(Boolean).find((part) => /^\d+$/.test(part));
    return `${host}/api/webhooks/${id ?? ""}/…`;
  }
  if (kind === "slack") return `${host}/${url.pathname.split("/")[1]}/…`;
  if (kind === "googlechat") return `${host}/v1/spaces/${url.pathname.split("/")[3]}/…`;
  if (kind === "telegram") return `${host}/bot${url.pathname.match(TELEGRAM_PATH)?.[1] ?? ""}:…/sendMessage`;
  if (kind === "guilded") return `${host}/webhooks/${url.pathname.split("/")[2]}/…`;
  if (kind === "mattermost") return `${host}/hooks/…`;
  return `${host}/…`;
}

export function detectWebhook(raw: string): DetectedWebhook {
  const text = raw.trim();
  if (!text) return { ok: false, error: "Paste a webhook URL." };
  if (text.length > MAX_WEBHOOK_URL_LENGTH) {
    return { ok: false, error: "That URL is too long." };
  }

  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return { ok: false, error: "That doesn't look like a URL." };
  }

  if (url.protocol !== "https:") {
    return { ok: false, error: "Webhook URLs have to start with https://." };
  }
  if (url.username || url.password) {
    return { ok: false, error: "Remove the username and password from the URL." };
  }

  const host = url.hostname.toLowerCase();
  if (looksInternal(host)) {
    return { ok: false, error: "That address is inside a private network. Use a public URL with a domain name." };
  }

  url.hash = "";

  if (DISCORD_HOSTS.has(host)) {
    if (!DISCORD_PATH.test(url.pathname)) {
      return {
        ok: false,
        error: "That's a Discord link, but not a webhook. Copy it from Channel settings, Integrations, Webhooks.",
      };
    }
    return { ok: true, kind: "discord", url: url.toString(), hint: hintFor("discord", url) };
  }

  if (host === SLACK_HOST) {
    if (!SLACK_PATH.test(url.pathname)) {
      return { ok: false, error: "That's a Slack link, but not an incoming webhook URL." };
    }
    return { ok: true, kind: "slack", url: url.toString(), hint: hintFor("slack", url) };
  }

  if (TEAMS_HOSTS.some((suffix) => host.endsWith(suffix))) {
    return { ok: true, kind: "teams", url: url.toString(), hint: hintFor("teams", url) };
  }

  if (host === GOOGLE_CHAT_HOST) {
    if (!GOOGLE_CHAT_PATH.test(url.pathname) || !url.searchParams.get("key") || !url.searchParams.get("token")) {
      return {
        ok: false,
        error: "That's a Google Chat link, but not a webhook. Copy the whole URL, it ends with key and token.",
      };
    }
    return { ok: true, kind: "googlechat", url: url.toString(), hint: hintFor("googlechat", url) };
  }

  if (host === TELEGRAM_HOST) {
    if (!TELEGRAM_PATH.test(url.pathname)) {
      return {
        ok: false,
        error: "Telegram URLs look like https://api.telegram.org/bot<token>/sendMessage?chat_id=<chat id>.",
      };
    }
    if (!url.searchParams.get("chat_id")) {
      return { ok: false, error: "Add ?chat_id=<chat id> to the end, so we know which chat to message." };
    }
    return { ok: true, kind: "telegram", url: url.toString(), hint: hintFor("telegram", url) };
  }

  if (host === GUILDED_HOST) {
    if (!GUILDED_PATH.test(url.pathname)) {
      return { ok: false, error: "That's a Guilded link, but not a webhook. Copy it from Server settings, Webhooks." };
    }
    return { ok: true, kind: "guilded", url: url.toString(), hint: hintFor("guilded", url) };
  }

  if (MATTERMOST_PATH.test(url.pathname)) {
    return { ok: true, kind: "mattermost", url: url.toString(), hint: hintFor("mattermost", url) };
  }

  return { ok: true, kind: "custom", url: url.toString(), hint: hintFor("custom", url) };
}
