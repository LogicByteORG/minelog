import { SITE_BASE } from "@/lib/config";
import { siteUrl } from "@/lib/site";

// Browsers ask for /favicon.ico on every host, even when the page is JSON or
// plain text. The API has no pages, so it points that request at the site's icon.
export function GET() {
  const site = process.env.SITE_URL ? siteUrl("") : SITE_BASE;
  return new Response(null, {
    status: 308,
    headers: {
      Location: `${site}/favicon.ico/favicon.ico`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
