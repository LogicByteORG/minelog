import { GUIDES } from "@/content/guides";
import { RETENTION_DAYS } from "@/lib/config";
import { SITE_NAME, SITE_TAGLINE, absoluteUrl } from "@/lib/seo";

export function GET() {
  const guideLines = GUIDES.map(
    (guide) => `- [${guide.title}](${absoluteUrl(guide.path)}): ${guide.description}`,
  );

  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_TAGLINE} Private details such as IP addresses and tokens are hidden before upload, and logs delete themselves after ${RETENTION_DAYS} days. You don't need an account.`,
    "",
    "## Guides",
    ...guideLines,
    "",
    "## Plugin",
    `- [Plugin and Skript docs](${absoluteUrl("/plugin")}): Connect a Minecraft server to minelog, get error alerts in Discord, Slack, Teams and more, and send your own alerts from Skript.`,
    "",
    "## API",
    `- [API documentation](${absoluteUrl("/api")}): Upload logs from launchers, mods and server panels. Includes an API that matches mclo.gs.`,
    "",
    "## More",
    `- [Privacy](${absoluteUrl("/privacy")}): What is hidden, what is stored and for how long.`,
    `- [Terms](${absoluteUrl("/terms")}): What you can upload, the limits and how long logs stay.`,
    `- [Rules](${absoluteUrl("/rules")}): What is allowed when sharing logs, connecting a server and sending alerts, including keeping player data out of webhooks.`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

