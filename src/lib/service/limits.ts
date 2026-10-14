import {
  ANALYSES_PER_MINUTE,
  MAX_ANALYSE_BYTES,
  MAX_LOG_BYTES,
  MAX_LOG_LINES,
  PREVIEW_RETENTION_HOURS,
  RETENTION_DAYS,
  UNHIDDEN_RETENTION_HOURS,
  UPLOADS_PER_DAY,
  UPLOADS_PER_MINUTE,
} from "@/lib/config";

export function apiRootBody(site: string, preview: boolean): {
  preview?: boolean;
  name: string;
  docs: string;
  protocols: { v2: string; mclogs: string };
  limits: string;
} {
  const rest = {
    name: "minelog API",
    docs: `${site}/api`,
    protocols: {
      v2: "/v2",
      mclogs: "/1",
    },
    limits: "/v2/limits",
  };
  return preview ? { preview: true, ...rest } : rest;
}

export function v2LimitsBody(preview: boolean): {
  retentionDays: number;
  retentionHours?: number;
  unhiddenRetentionHours: number;
  maxBytes: number;
  maxLines: number;
  uploadsPerMinute: number;
  uploadsPerDay: number;
  maxAnalyseBytes: number;
  analysesPerMinute: number;
} {
  const shared = {
    maxBytes: MAX_LOG_BYTES,
    maxLines: MAX_LOG_LINES,
    uploadsPerMinute: UPLOADS_PER_MINUTE,
    uploadsPerDay: UPLOADS_PER_DAY,
    maxAnalyseBytes: MAX_ANALYSE_BYTES,
    analysesPerMinute: ANALYSES_PER_MINUTE,
  };
  if (!preview) {
    return {
      retentionDays: RETENTION_DAYS,
      unhiddenRetentionHours: UNHIDDEN_RETENTION_HOURS,
      ...shared,
    };
  }
  return {
    retentionDays: 0,
    retentionHours: PREVIEW_RETENTION_HOURS,
    unhiddenRetentionHours: PREVIEW_RETENTION_HOURS,
    ...shared,
  };
}

export function compatLimitsBody(preview: boolean) {
  return {
    storageTime: preview ? PREVIEW_RETENTION_HOURS * 3600 : RETENTION_DAYS * 86400,
    maxLength: MAX_LOG_BYTES,
    maxLines: MAX_LOG_LINES,
  };
}
