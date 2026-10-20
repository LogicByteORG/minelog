import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LogPageView } from "@/components/log-page-view";
import { isValidId } from "@/lib/ids";
import { getCachedLogPage } from "@/lib/log-cache";
import { openGraphFor, logEmbedDescription, logEmbedTitle } from "@/lib/seo";
import { loaderName } from "@/lib/diagnose/present";

export const dynamic = "force-dynamic";

const getLog = cache(async (id: string) =>
  isValidId(id) ? getCachedLogPage(id) : null,
);

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

  return <LogPageView log={log} notice={notice} />;
}
