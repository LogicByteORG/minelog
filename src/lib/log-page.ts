import { readInsights } from "./diagnose/insights";
import type { Environment } from "./diagnose/types";
import type { Problem } from "./diagnose/problems";
import { classifyLine, kindLabel, type LogKind } from "./log";
import { takeHead } from "./log-head";
import type { StoredLog } from "./logs";

export type LogPageData = Omit<StoredLog, "content" | "createdAt" | "expiresAt"> & {
  createdAt: string;
  expiresAt: string;
  head: string;
  complete: boolean;
  label: string;
  excerpt: string;
  insights: { environment: Environment; problems: Problem[] } | null;
};

const ASK_AI_LINES = 40;
const ASK_AI_CHARS = 2000;

const isGameLog = (kind: LogKind) =>
  kind === "server" || kind === "client" || kind === "crash" || kind === "jvm";

export function errorExcerpt(content: string, kind: LogKind): string {
  const picked: string[] = [];
  let chars = 0;
  let capturing = false;
  for (const line of content.split(/\r?\n/)) {
    const info = classifyLine(line, kind);
    if (info.start) capturing = info.level === "error";
    if (!capturing) continue;
    picked.push(line);
    chars += line.length + 1;
    if (picked.length >= ASK_AI_LINES || chars >= ASK_AI_CHARS) break;
  }
  return picked.join("\n").slice(0, ASK_AI_CHARS).trim();
}

export function buildLogPage(log: StoredLog): LogPageData {
  const { content, createdAt, expiresAt, ...rest } = log;
  const whole = log.kind === "readme";
  const { head, complete } = whole
    ? { head: content, complete: true }
    : takeHead(content);

  const insights = isGameLog(log.kind) ? readInsights(content, log.kind) : null;

  return {
    ...rest,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    head,
    complete,
    label: kindLabel(log.kind, content),
    excerpt: errorExcerpt(content, log.kind),
    insights: insights
      ? { environment: insights.environment, problems: insights.problems }
      : null,
  };
}
