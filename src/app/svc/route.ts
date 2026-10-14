import { IS_PREVIEW, SITE_BASE } from "@/lib/config";
import { apiRootBody } from "@/lib/service/limits";
import { json, preflight } from "@/lib/service/respond";
import { siteUrl } from "@/lib/site";

export const OPTIONS = preflight;

export function GET() {
  const site = process.env.SITE_URL ? siteUrl("") : SITE_BASE;
  return json(apiRootBody(site, IS_PREVIEW));
}

