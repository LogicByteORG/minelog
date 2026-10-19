import type { Metadata } from "next";
import type { LogKind } from "./log";
import { pageBase } from "./site";

export const SITE_NAME = "minelog";

export const SITE_TAGLINE =
  "Share Minecraft server logs, client logs and crash reports with one link.";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

export function openGraphFor(page: {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  modifiedTime?: string;
  images?: OpenGraph["images"];
}): OpenGraph {
  return {
    type: page.type ?? "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: page.title,
    description: page.description,
    ...(page.path ? { url: page.path } : {}),
    ...(page.modifiedTime ? { modifiedTime: page.modifiedTime } : {}),
    images: page.images ?? [],
  } as OpenGraph;
}

const GAME_LOG_KINDS: ReadonlySet<LogKind> = new Set([
  "server",
  "client",
  "crash",
  "jvm",
]);

const EMBED_LIMIT = 300;

function cleanCause(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "");
}

export function logEmbedDescription(log: {
  kind: LogKind;
  lineCount: number;
  errorCount: number;
  warnCount: number;
  gameVersion?: string | null;
  loader?: string | null;
  problem?: string | null;
}): string {
  const lines = `${log.lineCount.toLocaleString("en")} ${log.lineCount === 1 ? "line" : "lines"}`;
  if (!GAME_LOG_KINDS.has(log.kind)) return `${lines}. Shared on minelog.`;
  const errors = `${log.errorCount.toLocaleString("en")} ${log.errorCount === 1 ? "error" : "errors"}`;
  const warnings = `${log.warnCount.toLocaleString("en")} ${log.warnCount === 1 ? "warning" : "warnings"}`;
  const base = `${lines}, ${errors}, ${warnings}.`;
  const suffix = "Shared on minelog.";
  const setup = [log.gameVersion?.trim(), log.loader?.trim()].filter(Boolean).join(" on ");
  const setupSentence = setup ? `Minecraft ${setup}.` : "";
  const cause = log.problem ? cleanCause(log.problem) : "";
  const causeSentence = cause ? `Likely cause: ${cause}.` : "";
  const full = [base, setupSentence, causeSentence, suffix].filter(Boolean).join(" ");
  if (full.length <= EMBED_LIMIT) return full;
  const withoutCause = [base, setupSentence, suffix].filter(Boolean).join(" ");
  if (!cause || withoutCause.length >= EMBED_LIMIT) return `${base} ${suffix}`;
  const prefix = [base, setupSentence].filter(Boolean).join(" ");
  const budget = EMBED_LIMIT - prefix.length - suffix.length - " Likely cause: . ".length;
  const clipped = cause.slice(0, Math.max(0, budget)).trim();
  return `${prefix} Likely cause: ${clipped}. ${suffix}`;
}

export function logEmbedTitle(log: {
  label: string;
  id: string;
  gameVersion?: string | null;
  loader?: string | null;
}): string {
  const base = log.label.trim() || "Log";
  const setup = [log.gameVersion?.trim(), log.loader?.trim()].filter(Boolean).join(" on ");
  const title = setup ? `${base} ${setup} | ${log.id}` : `${base} | ${log.id}`;
  return title.length <= 90 ? title : `${base} | ${log.id}`;
}

export function absoluteUrl(path = "/"): string {
  return `${pageBase()}${path === "/" ? "" : path}`;
}

export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(
    /[<>&\u2028\u2029]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
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

