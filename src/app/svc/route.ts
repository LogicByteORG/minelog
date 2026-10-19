import { IS_PREVIEW } from "@/lib/config";
import { apiRootBody } from "@/lib/service/limits";
import { json, preflight } from "@/lib/service/respond";
import { pageBase } from "@/lib/site";

export const OPTIONS = preflight;

export function GET() {
  const site = pageBase();
  return json(apiRootBody(site, IS_PREVIEW));
}

