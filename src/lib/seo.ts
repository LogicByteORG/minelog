import type { Metadata } from "next";
import { pageBase } from "./site";

export const SITE_NAME = "minelog";

export const SITE_TAGLINE =
  "Share Minecraft server logs, client logs and crash reports with one link.";

const OG_ALT = "minelog: share Minecraft logs and crash reports with one link";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

export function openGraphFor(page: {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  modifiedTime?: string;
}): OpenGraph {
  return {
    type: page.type ?? "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: page.title,
    description: page.description,
    ...(page.path ? { url: page.path } : {}),
    ...(page.modifiedTime ? { modifiedTime: page.modifiedTime } : {}),
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: OG_ALT }],
  } as OpenGraph;
}

export function absoluteUrl(path = "/"): string {
  return `${pageBase()}${path === "/" ? "" : path}`;
}

export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\u003c");
}

export type Crumb = { name: string; path: string };

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export type Faq = { question: string; answer: string };

export function faqLd(items: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

