import type { ReactNode } from "react";
import { DeleteLog } from "@/components/delete-log";
import { DonateNudge } from "@/components/donate-nudge";
import {
  BookOpen,
  DownloadSimple,
  Eye,
  LockSimple,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ShareLink } from "@/components/share-link";
import { ViewNotice } from "@/components/view-notice";
import { AskAiMenu } from "@/components/ask-ai";
import { AnalyzeMenu } from "@/components/analyze-menu";
import { ProblemsPanel } from "@/components/problems-panel";
import { LogWorkspace } from "@/components/workspace/log-workspace";
import { REPORT_EMAIL } from "@/lib/config";
import { DEFAULT_FEATURES, type PageFeature, type PageFeatures } from "@/lib/page-settings";
import { formatBytes } from "@/lib/log";
import type { LogPage } from "@/lib/log-cache";
import { downloadUrl, rawUrl } from "@/lib/site";
import { timeLeft } from "@/lib/retention";
import { formatUtc, timeAgo } from "@/lib/time";

const number = (value: number) => value.toLocaleString("en");
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function LogPageView({
  log,
  notice = false,
  isPrivate = false,
  features,
}: {
  log: LogPage;
  notice?: boolean;
  isPrivate?: boolean;
  // Set on a custom page: its header and footer come from the page layout.
  features?: PageFeatures;
}) {
  const custom = features !== undefined;
  const show = features ?? DEFAULT_FEATURES;
  const source = log.source;
  const { insights } = log;
  const raw = isPrivate ? `/p/${log.id}/raw` : rawUrl(log.id);
  const download = isPrivate ? `/p/${log.id}/raw?download=1` : downloadUrl(log.id);
  // On a custom page every switchable part is tagged, so the editor preview can hide it live.
  const gate = (key: PageFeature, node: ReactNode) =>
    custom ? (
      <span data-feature={key} className="feature">
        {node}
      </span>
    ) : (
      node
    );

  return (
    <>
      {!custom && <SiteHeader />}

      <main className="grid-container log-page">
        <div className="log-head settle">
          <div>
            <h1 className="log-head__title">{log.label}</h1>
            <p className="log-head__meta">
              {isPrivate && (
                <span
                  className="source-badge"
                  data-tip="Only you can open this log, and only while you're signed in"
                >
                  <LockSimple weight="bold" aria-hidden="true" />
                  Private
                </span>
              )}
              {show.details &&
                source &&
                gate(
                  "details",
                  <span className="source-badge" data-tip={`Uploaded from ${source}`}>
                    <DownloadSimple weight="bold" aria-hidden="true" />
                    {source}
                  </span>,
                )}
              {show.details &&
                gate(
                  "details",
                  log.privacyApplied ? (
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
                  ),
                )}
              <span>
                {number(log.lineCount)} lines, {formatBytes(log.byteSize)}. Saved{" "}
                <time dateTime={log.createdAt.toISOString()} data-tip={formatUtc(log.createdAt)}>
                  {timeAgo(log.createdAt)}
                </time>
                .
              </span>
            </p>
          </div>
          <div className="log-head__actions">
            {!isPrivate && show.share && gate("share", <ShareLink />)}
            {show.analysis && insights && gate("analysis", <AnalyzeMenu env={insights.environment} />)}
            {show.analysis &&
              insights &&
              gate("analysis", <ProblemsPanel problems={insights.problems} />)}
            {show.askAi && gate("askAi", <AskAiMenu excerpt={log.excerpt} />)}
            {log.kind === "readme" && !isPrivate && !custom && (
              <a
                href={`/${log.id}/view`}
                className="button hollow button--sm"
                data-tip="Read this README without the surrounding controls"
              >
                <BookOpen aria-hidden="true" />
                Clean view
              </a>
            )}
            {show.raw &&
              gate(
                "raw",
                <a
                  href={raw}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button hollow button--sm"
                  data-tip="The whole log as plain text, in a new tab"
                >
                  Raw
                </a>,
              )}
          </div>
        </div>

        {!log.privacyApplied && (
          <div className="callout warning log-head__notice">
            <WarningCircle aria-hidden="true" />
            <span>
              Private details weren&apos;t hidden in this log, so it&apos;s deleted early,{" "}
              {timeLeft(log.expiresAt)}.
              {isPrivate ? "" : " Anyone with the link can see everything in it."}
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
          rawUrl={raw}
          downloadUrl={download}
          isPrivate={isPrivate}
        />

        {!custom && <DonateNudge />}

        <p className="log-page__expiry">
          This log is deleted on{" "}
          <time dateTime={log.expiresAt.toISOString()} data-tip={formatUtc(log.expiresAt)}>
            {isoDate(log.expiresAt)}
          </time>{" "}
          ({timeLeft(log.expiresAt)}).
        </p>

        {!custom && <DeleteLog logId={log.id} />}

        <p className="log-page__report">
          Is this log harmful or upsetting? Write to{" "}
          <a href={`mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(`Report log ${log.id}`)}`}>
            {REPORT_EMAIL}
          </a>{" "}
          and we&apos;ll take a look.
        </p>
      </main>

      {!custom && <SiteFooter />}
    </>
  );
}
