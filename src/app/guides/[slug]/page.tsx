import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideView } from "@/components/guide-view";
import { GUIDES, guideBySlug } from "@/content/guides";
import { openGraphFor } from "@/lib/seo";

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return {};
  return {
    title: guide.metaTitle,
    description: guide.description,
    alternates: { canonical: guide.path },
    openGraph: openGraphFor({
      type: "article",
      path: guide.path,
      title: guide.metaTitle,
      description: guide.description,
      modifiedTime: guide.updated,
    }),
  };
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  return (
    <GuideView
      guide={guide}
      crumbs={[
        { name: "Home", path: "/" },
        { name: "Guides", path: "/guides" },
        { name: guide.title, path: guide.path },
      ]}
    />
  );
}
