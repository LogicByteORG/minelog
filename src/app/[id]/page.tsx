import { DeleteLog } from "@/components/delete-log";
import { DonateNudge } from "@/components/donate-nudge";
import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen, DownloadSimple, Eye, ShieldCheck, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ShareLink } from "@/components/share-link";
import { ViewNotice } from "@/components/view-notice";
import { AskAiMenu } from "@/components/ask-ai";
import { AnalyzeMenu } from "@/components/analyze-menu";
import { ProblemsPanel } from "@/components/problems-panel";
import { LogWorkspace } from "@/components/workspace/log-workspace";
import { REPORT_EMAIL } from "@/lib/config";
import { isValidId } from "@/lib/ids";
import { formatBytes } from "@/lib/log";
import { getCachedLogPage } from "@/lib/log-cache";
import { openGraphFor, logEmbedDescription, logEmbedTitle } from "@/lib/seo";
import { downloadUrl, rawUrl } from "@/lib/site";
import { timeLeft } from "@/lib/retention";
import { formatUtc, timeAgo } from "@/lib/time";
import { loaderName } from "@/lib/diagnose/present";

export const dynamic = "force-dynamic";

const getLog = cache(async (id: string) =>
  isValidId(id) ? getCachedLogPage(id) : null,
);

const number = (value: number) => value.toLocaleString("en");
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export async function generateMetadata({
  params,
}: PageProps<"/[id]">): Promise<Metadata> {
  const { id } = await params;
  const log = await getLog(id);
  if (!log) {
    return { title: "Log not found", robots: { index: false, follow: false } };
  }

  const gameVersion = log.insights?.environment.gameVersion?.value ?? null;
  const loaderFact = log.insights?.environment.loader;
  const loader = loaderFact ? loaderName(loaderFact.value) : null;
  const problem = log.insights?.problems[0]?.message ?? null;
  const title = logEmbedTitle({ label: log.label, id: log.id, gameVersion, loader });
  const description = logEmbedDescription({
    kind: log.kind,
    lineCount: log.lineCount,
    errorCount: log.errorCount,
    warnCount: log.warnCount,
    gameVersion,
    loader,
    problem,
  });

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: openGraphFor({
      type: "article",
      title,
      description,
      path: `/${log.id}`,
      images: [],
    }),
    twitter: { card: "summary", title, description, images: [] },
  };
}

export default async function LogPage({
  params,
  searchParams,
}: PageProps<"/[id]">) {
  const { id } = await params;
  const log = await getLog(id);
  if (!log) notFound();

  const notice = (await searchParams)?.notice === "readme-view-only";

  const source = log.source;
  const { insights } = log;

  return (
    <>
      <SiteHeader />

      <main className="grid-container log-page">
        <div className="log-head settle">
          <div>
            <h1 className="log-head__title">
              {log.label}
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
              {log.privacyApplied ? (
                <span
                  className="source-badge"
                  data-tip="IP addresses, tokens, emails and user folder names were hidden before saving"
                >
                  <ShieldCheck weight="bold" aria-hidden="true" />
                  Private details hidden
                </span>
              ) : (
                <span
                  className="source-badge source-badge--warn"
                  data-tip="Nothing was hidden in this log. It is deleted early to limit the risk."
                >
                  <Eye weight="bold" aria-hidden="true" />
                  Not hidden
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
            <AskAiMenu excerpt={log.excerpt} />
            {log.kind === "readme" && (
              <a
                href={`/${log.id}/view`}
                className="button hollow button--sm"
                data-tip="Read this README without the surrounding controls"
              >
                <BookOpen aria-hidden="true" />
                Clean view
              </a>
            )}
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
            <span>
              Private details weren&apos;t hidden in this log, so it&apos;s
              deleted early, {timeLeft(log.expiresAt)}. Anyone with the link
              can see everything in it.
            </span>
          </div>
        )}

        {notice && <ViewNotice />}

        <LogWorkspace
          content={log.head}
          complete={log.complete}
          totalLines={log.lineCount}
          totalBytes={log.byteSize}
          kind={log.kind}
          logId={log.id}
          rawUrl={rawUrl(log.id)}
          downloadUrl={downloadUrl(log.id)}
        />

        <DonateNudge />

        <p className="log-page__expiry">
          This log is deleted on{" "}
          <time
            dateTime={log.expiresAt.toISOString()}
            data-tip={formatUtc(log.expiresAt)}
          >
            {isoDate(log.expiresAt)}
          </time>{" "}
          ({timeLeft(log.expiresAt)}).
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

