import { SITE_BASE } from "@/lib/config";
import { json, preflight } from "@/lib/service/respond";
import { siteUrl } from "@/lib/site";

export const OPTIONS = preflight;

export function GET() {
  const site = process.env.SITE_URL ? siteUrl("") : SITE_BASE;
  return json({
    name: "minelog API",
    docs: `${site}/api`,
    protocols: {
      v2: "/v2",
      mclogs: "/1",
    },
    limits: "/v2/limits",
  });
}

