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
    `> ${SITE_TAGLINE} Private details such as IP addresses and tokens are hidden before upload, and logs delete themselves after ${RETENTION_DAYS} days. There are no accounts.`,
    "",
    "## Guides",
    ...guideLines,
    "",
    "## API",
    `- [API documentation](${absoluteUrl("/api")}): Upload logs from launchers, mods and server panels. Includes an API that matches mclo.gs.`,
    "",
    "## More",
    `- [Privacy](${absoluteUrl("/privacy")}): What is hidden, what is stored and for how long.`,
    `- [Terms](${absoluteUrl("/terms")}): What you can upload, the limits and how long logs stay.`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

