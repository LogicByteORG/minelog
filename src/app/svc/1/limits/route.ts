import { MAX_LOG_BYTES, MAX_LOG_LINES, RETENTION_DAYS } from "@/lib/config";
import { json, preflight } from "@/lib/service/respond";

export const OPTIONS = preflight;

export function GET() {
  return json({
    storageTime: RETENTION_DAYS * 86400,
    maxLength: MAX_LOG_BYTES,
    maxLines: MAX_LOG_LINES,
  });
}

