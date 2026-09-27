import { deletableUntil, type LogInfo, type SavedLog } from "@/lib/logs";
import { apiBase, pageBase } from "@/lib/site";

const iso = (date: Date) => date.toISOString().replace(/\.\d{3}Z$/, "Z");
const unix = (date: Date) => Math.floor(date.getTime() / 1000);

export function bases(request: Request) {
  return {
    page: pageBase(),
    api: apiBase(new URL(request.url).origin),
  };
}

export function describeV2(log: LogInfo, request: Request) {
  const { page, api } = bases(request);
  return {
    id: log.id,
    url: `${page}/${log.id}`,
    raw: `${api}/v2/logs/${log.id}/raw`,
    source: log.source,
    kind: log.kind,
    lines: log.lineCount,
    size: log.byteSize,
    errors: log.errorCount,
    warnings: log.warnCount,
    privacyApplied: log.privacyApplied,
    createdAt: iso(log.createdAt),
    expiresAt: iso(log.expiresAt),
  };
}

export function describeCompat(log: LogInfo, request: Request) {
  const { page, api } = bases(request);
  return {
    success: true,
    id: log.id,
    source: log.source,
    created: unix(log.createdAt),
    expires: unix(log.expiresAt),
    size: log.byteSize,
    lines: log.lineCount,
    errors: log.errorCount,
    url: `${page}/${log.id}`,
    raw: `${api}/1/raw/${log.id}`,
    metadata: [],
  };
}

export function describeV2Created(log: SavedLog, request: Request) {
  return {
    ...describeV2(log, request),
    deleteToken: log.deleteToken,
    deletableUntil: iso(deletableUntil(log.createdAt)),
  };
}

export function describeCompatCreated(log: SavedLog, request: Request) {
  return { ...describeCompat(log, request), token: log.deleteToken };
}

