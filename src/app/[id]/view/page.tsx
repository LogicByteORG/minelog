import { cache } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ReadmeMiniView } from "@/components/readme-mini-view";
import { isValidId } from "@/lib/ids";
import { kindLabel } from "@/lib/log";
import { getCachedLog } from "@/lib/log-cache";
import { openGraphFor, logEmbedDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

const getLog = cache(async (id: string) =>
  isValidId(id) ? getCachedLog(id) : null,
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const log = await getLog(id);
  if (!log) {
    return { title: "Log not found", robots: { index: false, follow: false } };
  }

  const title = `${kindLabel(log.kind, log.content)} | ${log.id}`;
  const description = logEmbedDescription(log);

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: openGraphFor({
      type: "article",
      title,
      description,
      path: `/${log.id}/view`,
      images: [],
    }),
    twitter: { card: "summary", title, description, images: [] },
  };
}

export default async function ReadmeViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const log = await getLog(id);
  if (!log) notFound();
  if (log.kind !== "readme") redirect(`/${log.id}?notice=readme-view-only`);

  return (
    <>
      <SiteHeader minimal />

      <main className="grid-container readme-view-page">
        <ReadmeMiniView content={log.content} />
      </main>

      <SiteFooter />
    </>
  );
}
