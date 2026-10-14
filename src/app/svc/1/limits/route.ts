import { IS_PREVIEW } from "@/lib/config";
import { compatLimitsBody } from "@/lib/service/limits";
import { json, preflight } from "@/lib/service/respond";

export const OPTIONS = preflight;

export function GET() {
  return json(compatLimitsBody(IS_PREVIEW));
}

