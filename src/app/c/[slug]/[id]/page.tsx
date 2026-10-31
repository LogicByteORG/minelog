import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LogPageView } from "@/components/log-page-view";
import { isValidId } from "@/lib/ids";
import { getCachedLogPage } from "@/lib/log-cache";
import { findPageBySlug, logBelongsToPage } from "@/lib/log-pages";

export async function generateMetadata({
  params,
}: PageProps<"/c/[slug]/[id]">): Promise<Metadata> {
  const { id } = await params;
  const log = isValidId(id) ? await getCachedLogPage(id) : null;
  return { title: log?.label ?? "Log not found" };
}

export default async function CustomLogPage({ params }: PageProps<"/c/[slug]/[id]">) {
  const { slug, id } = await params;
  const page = await findPageBySlug(slug);
  if (!page || !isValidId(id)) notFound();
  if (!(await logBelongsToPage(id, page.id))) notFound();

  const log = await getCachedLogPage(id);
  if (!log) notFound();

  return <LogPageView log={log} features={page.features} />;
}
