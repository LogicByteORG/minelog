import {
  ANALYSES_PER_MINUTE,
  MAX_ANALYSE_BYTES,
  MAX_LOG_BYTES,
  MAX_LOG_LINES,
  RETENTION_DAYS,
  UNHIDDEN_RETENTION_HOURS,
  UPLOADS_PER_DAY,
  UPLOADS_PER_MINUTE,
} from "@/lib/config";
import { json, preflight } from "@/lib/service/respond";

export const OPTIONS = preflight;

export function GET() {
  return json({
    retentionDays: RETENTION_DAYS,
    unhiddenRetentionHours: UNHIDDEN_RETENTION_HOURS,
    maxBytes: MAX_LOG_BYTES,
    maxLines: MAX_LOG_LINES,
    uploadsPerMinute: UPLOADS_PER_MINUTE,
    uploadsPerDay: UPLOADS_PER_DAY,
    maxAnalyseBytes: MAX_ANALYSE_BYTES,
    analysesPerMinute: ANALYSES_PER_MINUTE,
  });
}

