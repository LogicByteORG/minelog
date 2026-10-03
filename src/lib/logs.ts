import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  DELETE_WINDOW_MINUTES,
  MAX_LOG_BYTES,
  MAX_LOG_LINES,
  UPLOADS_PER_DAY,
  UPLOADS_PER_MINUTE,
} from "./config";
import { db } from "./db";
import { createId } from "./ids";
import { retentionHours } from "./retention";
import { analyze, detectKind, type LogKind } from "./log";

export class LogTooLargeError extends Error {
  constructor() {
    super("This log is too large.");
    this.name = "LogTooLargeError";
  }
}

export class LogTooLongError extends Error {
  constructor() {
    super(`This log has too many lines. The limit is ${MAX_LOG_LINES.toLocaleString("en")}.`);
    this.name = "LogTooLongError";
  }
}

export class BlockedContentError extends Error {
  category?: string;
  detail?: string;
  constructor(category?: string, detail?: string) {
    super("This log contains content we cannot host.");
    this.name = "BlockedContentError";
    this.category = category;
    this.detail = detail;
  }
}

export class RateLimitedError extends Error {
  scope: "minute" | "day";
  retryAfter: number;
  constructor(scope: "minute" | "day", retryAfter: number) {
    super("Too many uploads from this connection.");
    this.name = "RateLimitedError";
    this.scope = scope;
    this.retryAfter = retryAfter;
  }
}

async function whyRefused(ipHash: string): Promise<RateLimitedError> {
  const [row] = await db()<{ lastMinute: number; lastDay: number; minuteWait: number; dayWait: number }[]>`
    select
      (count(*) filter (where created_at > now() - interval '1 minute'))::int as last_minute,
      count(*)::int as last_day,
      coalesce(extract(epoch from (min(created_at) filter (where created_at > now() - interval '1 minute')
        + interval '1 minute' - now())), 60)::int as minute_wait,
      coalesce(extract(epoch from (min(created_at) + interval '1 day' - now())), 86400)::int as day_wait
    from public.logs
    where ip_hash = ${ipHash} and created_at > now() - interval '1 day'
  `;
  if (row && row.lastDay >= UPLOADS_PER_DAY) {
    return new RateLimitedError("day", Math.max(1, row.dayWait));
  }
  return new RateLimitedError("minute", Math.max(1, row?.minuteWait ?? 60));
}

export type StoredLog = {
  id: string;
  content: string;
  kind: LogKind;
  lineCount: number;
  byteSize: number;
  errorCount: number;
  warnCount: number;
  privacyApplied: boolean;
  source: string | null;
  createdAt: Date;
  expiresAt: Date;
};

export type LogInfo = Omit<StoredLog, "content">;

export type SavedLog = LogInfo & { deleteToken: string };

export function deletableUntil(createdAt: Date): Date {
  return new Date(createdAt.getTime() + DELETE_WINDOW_MINUTES * 60_000);
}

function createDeleteToken(): string {
  return randomBytes(24).toString("base64url");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function hashIp(ip: string): string {
  const secret = process.env.IP_HASH_SECRET;
  if (!secret) {
    throw new Error(
      "IP_HASH_SECRET is not set. Copy .env.example to .env.local and fill it in.",
    );
  }
  return createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

type SaveInput = {
  content: string;
  hidePrivate: boolean;
  ipHash: string;
  source: string | null;
};

export async function saveLog({
  content,
  hidePrivate,
  ipHash,
  source,
}: SaveInput): Promise<SavedLog> {
  const cleaned = content.replaceAll("\u0000", "");

  const analysis = analyze(cleaned, hidePrivate);
  if (analysis.blocked) throw new BlockedContentError(analysis.blockCategory, analysis.blockMessage);
  if (analysis.bytes > MAX_LOG_BYTES) throw new LogTooLargeError();
  if (analysis.lineCount > MAX_LOG_LINES) throw new LogTooLongError();

  const deleteToken = createDeleteToken();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = createId();
    try {
      const [row] = await db()<{ createdAt: Date; expiresAt: Date }[]>`
        insert into public.logs
          (id, content, kind, line_count, byte_size, error_count, warn_count,
           privacy_applied, ip_hash, source, delete_token_hash, expires_at)
        select
          ${id}, ${analysis.output}, ${analysis.kind}, ${analysis.lineCount},
          ${analysis.bytes}, ${analysis.errorCount}, ${analysis.warnCount},
          ${hidePrivate}, ${ipHash}, ${source}, ${hashToken(deleteToken)},
          now() + make_interval(hours => ${retentionHours(hidePrivate)})
        from (
          select
            count(*) filter (where created_at > now() - interval '1 minute') as last_minute,
            count(*) as last_day
          from public.logs
          where ip_hash = ${ipHash} and created_at > now() - interval '1 day'
        ) as recent
        where recent.last_minute < ${UPLOADS_PER_MINUTE} and recent.last_day < ${UPLOADS_PER_DAY}
        returning created_at, expires_at
      `;
      if (!row) throw await whyRefused(ipHash);
      return {
        id,
        kind: analysis.kind,
        lineCount: analysis.lineCount,
        byteSize: analysis.bytes,
        errorCount: analysis.errorCount,
        warnCount: analysis.warnCount,
        privacyApplied: hidePrivate,
        source,
        createdAt: row.createdAt,
        expiresAt: row.expiresAt,
        deleteToken,
      };
    } catch (error) {
      const isCollision = (error as { code?: string }).code === "23505";
      if (!isCollision) throw error;
    }
  }
  throw new Error("Could not find a free log id.");
}

export async function findLog(id: string): Promise<StoredLog | null> {
  const [row] = await db()<StoredLog[]>`
    select id, content, kind, line_count, byte_size, error_count, warn_count,
           privacy_applied, source, created_at, expires_at
    from public.logs
    where id = ${id} and expires_at > now()
  `;
  if (!row) return null;
  if (row.kind === "server" && detectKind(row.content) === "client") {
    row.kind = "client";
  }
  return row;
}

export async function findLogInfo(id: string): Promise<LogInfo | null> {
  const [row] = await db()<LogInfo[]>`
    select id, kind, line_count, byte_size, error_count, warn_count,
           privacy_applied, source, created_at, expires_at
    from public.logs
    where id = ${id} and expires_at > now()
  `;
  return row ?? null;
}

export async function findLogText(id: string): Promise<string | null> {
  const [row] = await db()<{ content: string }[]>`
    select content
    from public.logs
    where id = ${id} and expires_at > now()
  `;
  return row?.content ?? null;
}

export type DeleteResult =
  | { status: "deleted" }
  | { status: "not_found" }
  | { status: "invalid_token" }
  | { status: "not_deletable"; expiresAt: Date }
  | { status: "window_closed"; expiresAt: Date };

export async function deleteLog(id: string, token: string): Promise<DeleteResult> {
  const [row] = await db()<
    { deleteTokenHash: string | null; expiresAt: Date }[]
  >`
    select delete_token_hash, expires_at
    from public.logs
    where id = ${id} and expires_at > now()
  `;
  if (!row) return { status: "not_found" };

  if (row.deleteTokenHash === null) {
    return { status: "not_deletable", expiresAt: row.expiresAt };
  }

  const given = Buffer.from(hashToken(token), "hex");
  const stored = Buffer.from(row.deleteTokenHash, "hex");
  if (given.length !== stored.length || !timingSafeEqual(given, stored)) {
    return { status: "invalid_token" };
  }

  const deleted = await db()<{ id: string }[]>`
    delete from public.logs
    where id = ${id}
      and delete_token_hash = ${row.deleteTokenHash}
      and created_at > now() - make_interval(mins => ${DELETE_WINDOW_MINUTES})
    returning id
  `;
  if (deleted.length > 0) return { status: "deleted" };

  const [still] = await db()<{ id: string }[]>`
    select id from public.logs where id = ${id}
  `;
  return still ? { status: "window_closed", expiresAt: row.expiresAt } : { status: "not_found" };
}

