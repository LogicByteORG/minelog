import { DeleteLog } from "@/components/delete-log";
import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DownloadSimple, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ShareLink } from "@/components/share-link";
import { AskAiMenu } from "@/components/ask-ai";
import { AnalyzeMenu } from "@/components/analyze-menu";
import { ProblemsPanel } from "@/components/problems-panel";
import { LogWorkspace } from "@/components/workspace/log-workspace";
import { REPORT_EMAIL } from "@/lib/config";
import { readInsights } from "@/lib/diagnose/insights";
import { isValidId } from "@/lib/ids";
import { classifyLine, formatBytes, kindLabel, type LogKind } from "@/lib/log";
import { getCachedLog } from "@/lib/log-cache";
import { openGraphFor } from "@/lib/seo";
import { rawUrl } from "@/lib/site";
import { formatUtc, timeAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

const getLog = cache(async (id: string) =>
  isValidId(id) ? getCachedLog(id) : null,
);

const isGameLog = (kind: LogKind) =>
  kind === "server" || kind === "client" || kind === "crash" || kind === "jvm";

const number = (value: number) => value.toLocaleString("en");
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

function daysLeft(expires: Date): string {
  const days = Math.ceil((expires.getTime() - Date.now()) / 86_400_000);
  if (days <= 1) return "within a day";
  return `in ${days} days`;
}

const ASK_AI_LINES = 40;
const ASK_AI_CHARS = 2000;

function errorExcerpt(content: string, kind: LogKind): string {
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

export async function generateMetadata({
  params,
}: PageProps<"/[id]">): Promise<Metadata> {
  const { id } = await params;
  const log = await getLog(id);
  if (!log) {
    return { title: "Log not found", robots: { index: false, follow: false } };
  }

  const counts = [
    `${number(log.lineCount)} ${log.lineCount === 1 ? "line" : "lines"}`,
    log.errorCount > 0
      ? `${number(log.errorCount)} ${log.errorCount === 1 ? "error" : "errors"}`
      : null,
    log.warnCount > 0
      ? `${number(log.warnCount)} ${log.warnCount === 1 ? "warning" : "warnings"}`
      : null,
  ].filter(Boolean);
  const title = `${kindLabel(log.kind, log.content)} | ${log.id}`;
  const description = `${counts.join(", ")}. Shared on minelog.`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: openGraphFor({ type: "article", title, description }),
  };
}

export default async function LogPage({ params }: PageProps<"/[id]">) {
  const { id } = await params;
  const log = await getLog(id);
  if (!log) notFound();

  const source = log.source;
  const insights = isGameLog(log.kind) ? readInsights(log.content, log.kind) : null;

  return (
    <>
      <SiteHeader />

      <main className="grid-container log-page">
        <div className="log-head settle">
          <div>
            <h1 className="log-head__title">
              {kindLabel(log.kind, log.content)}
            </h1>
            <p className="log-head__meta">
              {source && (
                <span
                  className="source-badge"
                  data-tip={`Uploaded from ${source}`}
                >
                  <DownloadSimple weight="bold" aria-hidden="true" />
                  {source}
                </span>
              )}
              <span>
                {number(log.lineCount)} lines, {formatBytes(log.byteSize)}.
                Saved{" "}
                <time
                  dateTime={log.createdAt.toISOString()}
                  data-tip={formatUtc(log.createdAt)}
                >
                  {timeAgo(log.createdAt)}
                </time>
                .
              </span>
            </p>
          </div>
          <div className="log-head__actions">
            <ShareLink />
            {insights && <AnalyzeMenu env={insights.environment} />}
            {insights && <ProblemsPanel problems={insights.problems} />}
            <AskAiMenu excerpt={errorExcerpt(log.content, log.kind)} />
            <a
              href={rawUrl(log.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="button hollow button--sm"
              data-tip="The whole log as plain text, in a new tab"
            >
              Raw
            </a>
          </div>
        </div>

        {!log.privacyApplied && (
          <div className="callout warning log-head__notice">
            <WarningCircle aria-hidden="true" />
            <span>Private details weren&apos;t hidden in this log.</span>
          </div>
        )}

        <LogWorkspace
          content={log.content}
          kind={log.kind}
          logId={log.id}
          rawUrl={rawUrl(log.id)}
        />

        <p className="log-page__expiry">
          This log is deleted on{" "}
          <time
            dateTime={log.expiresAt.toISOString()}
            data-tip={formatUtc(log.expiresAt)}
          >
            {isoDate(log.expiresAt)}
          </time>{" "}
          ({daysLeft(log.expiresAt)}).
        </p>

        <DeleteLog logId={log.id} />

        <p className="log-page__report">
          Is this log harmful or upsetting? Write to{" "}
          <a
            href={`mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(`Report log ${log.id}`)}`}>
            {REPORT_EMAIL}
          </a>{" "}
          and we&apos;ll take a look.
        </p>
      </main>

      <SiteFooter />
    </>
  );
}

