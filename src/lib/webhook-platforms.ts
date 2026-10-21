import type { WebhookKind } from "./webhook-url";

export type Platform = {
  kind: WebhookKind;
  name: string;
  where: string;
  looks: string;
  note: string;
};

export const PLATFORMS: Platform[] = [
  {
    kind: "discord",
    name: "Discord",
    where: "Channel settings, Integrations, Webhooks, New Webhook, Copy Webhook URL.",
    looks: "discord.com/api/webhooks/…",
    note: "Alerts arrive as a message card.",
  },
  {
    kind: "slack",
    name: "Slack",
    where: "Create an app, turn on Incoming Webhooks, Add New Webhook to Workspace.",
    looks: "hooks.slack.com/services/…",
    note: "Alerts arrive as an attachment with a colour bar.",
  },
  {
    kind: "teams",
    name: "Microsoft Teams",
    where: "In the channel, More options, Workflows, “Post to a channel when a webhook request is received”.",
    looks: "….logic.azure.com/workflows/…",
    note: "Alerts arrive as an Adaptive Card.",
  },
  {
    kind: "googlechat",
    name: "Google Chat",
    where: "In a space, Apps & integrations, Webhooks, Add webhook. Copy the whole URL, it includes the key and token.",
    looks: "chat.googleapis.com/v1/spaces/…/messages?key=…&token=…",
    note: "Alerts arrive as a plain message.",
  },
  {
    kind: "telegram",
    name: "Telegram",
    where: "Make a bot with @BotFather, add it to your chat, then build the URL below with your bot token and chat id.",
    looks: "api.telegram.org/bot<token>/sendMessage?chat_id=<chat id>",
    note: "Alerts arrive as a message from your bot.",
  },
  {
    kind: "guilded",
    name: "Guilded",
    where: "Server settings, Webhooks, Create Webhook, Copy URL.",
    looks: "media.guilded.gg/webhooks/…",
    note: "Alerts arrive as an embed, the same way as on Discord.",
  },
  {
    kind: "mattermost",
    name: "Mattermost",
    where: "Product menu, Integrations, Incoming Webhooks, Add Incoming Webhook.",
    looks: "your-server.com/hooks/<26 characters>",
    note: "Alerts arrive as an attachment. The server needs a public https address.",
  },
];
