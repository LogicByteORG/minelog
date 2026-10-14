import { IS_PREVIEW } from "@/lib/config";
import { v2LimitsBody } from "@/lib/service/limits";
import { json, preflight } from "@/lib/service/respond";

export const OPTIONS = preflight;

export function GET() {
  return json(v2LimitsBody(IS_PREVIEW));
}

