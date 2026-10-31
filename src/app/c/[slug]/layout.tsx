import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveBrand } from "@/components/brand-page/live-brand";
import { findPageBySlug } from "@/lib/log-pages";
import { PAGE_FEATURES, logoSources } from "@/lib/page-settings";
import { cdnBase } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: LayoutProps<"/c/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await findPageBySlug(slug);
  return {
    // A log page reads "<log> · <brand>", the demo and the paste view just the brand.
    title: !page
      ? "Page not found"
      : page.name
        ? { absolute: page.name, template: `%s · ${page.name}` }
        : { absolute: "Log", template: "%s" },
    robots: { index: false, follow: false },
  };
}

export default async function CustomPageLayout({
  children,
  params,
}: LayoutProps<"/c/[slug]"> & { children: ReactNode }) {
  const { slug } = await params;
  const page = await findPageBySlug(slug);
  if (!page) notFound();

  return (
    <LiveBrand
      initial={{
        theme: page.theme,
        radius: page.buttonRadius,
        name: page.name,
        logo: logoSources(page, cdnBase()),
        off: PAGE_FEATURES.filter(({ key }) => !page.features[key]).map(({ key }) => key),
      }}
      href={page.logoUrl}
    >
      {children}
    </LiveBrand>
  );
}
