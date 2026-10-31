"use server";

import { revalidatePath } from "next/cache";
import { PAGES_PER_ACCOUNT, PAGE_LOGO_MAX_BYTES } from "@/lib/config";
import { ID_PATTERN, cleanLabel } from "@/lib/label";
import { claimDomain, forgetHost, releaseDomain, setDomainVerified } from "@/lib/custom-domains";
import {
  checkDomain,
  dnsRecords,
  type DnsRecord,
  type DomainState,
} from "@/lib/domain-settings";
import {
  createPage,
  deletePage,
  findOwnedPage,
  issuePageKey,
  updatePage,
  type LogoChange,
} from "@/lib/log-pages";
import {
  addDomain,
  domainsConfigured,
  readDomain,
  removeDomain,
  type DomainReport,
} from "@/lib/vercel-domains";
import {
  PAGE_FEATURES,
  PAGE_NAME_MAX,
  checkLogoUrl,
  checkRadius,
  checkSlug,
  randomSlug,
  readTheme,
  sniffLogo,
  type PageFeatures,
} from "@/lib/page-settings";
import { requireSession } from "@/lib/session";

const PATH = "/dash/pages";

export type PageOutcome = { ok: true } | { ok: false; error: string };

export type CreatedPage = { ok: true; id: string } | { ok: false; error: string };

const GONE = { ok: false, error: "That page doesn't exist anymore." } as const;

const SLUG_TAKEN = "That address is already taken. Pick another.";

export async function addPage(): Promise<CreatedPage> {
  const { user } = await requireSession();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const created = await createPage(user.id, randomSlug());
    if (created.ok) {
      revalidatePath(PATH);
      return { ok: true, id: created.id };
    }
    if (created.reason === "limit") {
      return {
        ok: false,
        error: `You can have up to ${PAGES_PER_ACCOUNT} custom pages. Delete one first.`,
      };
    }
  }
  return { ok: false, error: "Couldn't create the page. Try again in a moment." };
}

async function readLogo(
  data: FormData,
  field: string,
  removeField: string,
  side: string,
): Promise<LogoChange | string> {
  if (data.get(removeField) === "1") return { kind: "remove" };
  const file = data.get(field);
  if (!(file instanceof File) || file.size === 0) return { kind: "keep" };
  if (file.size > PAGE_LOGO_MAX_BYTES) {
    return `The ${side} logo is over ${PAGE_LOGO_MAX_BYTES / 1024} KB. Use a smaller image.`;
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const type = sniffLogo(bytes);
  if (!type) return `The ${side} logo must be a PNG, JPEG or WebP image.`;
  return { kind: "set", bytes, type };
}

export async function savePage(id: string, data: FormData): Promise<PageOutcome> {
  const { user } = await requireSession();
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return GONE;

  const name = cleanLabel(data.get("name"), PAGE_NAME_MAX);
  if (name === null) {
    return { ok: false, error: `Use ${PAGE_NAME_MAX} characters or fewer for the name.` };
  }

  const slug = checkSlug(data.get("slug"));
  if (!slug.ok) return slug;

  const link = checkLogoUrl(data.get("logoUrl"));
  if (!link.ok) return link;

  const radius = checkRadius(data.get("buttonRadius"));
  if (radius === null) return { ok: false, error: "Button corners must be between 0 and 24." };

  const features = Object.fromEntries(
    PAGE_FEATURES.map(({ key }) => [key, data.get(`feature-${key}`) === "1"]),
  ) as PageFeatures;

  let theme;
  try {
    theme = readTheme(JSON.parse(String(data.get("theme") ?? "{}")));
  } catch {
    return { ok: false, error: "Those theme settings couldn't be read. Reload the page and try again." };
  }

  const light = await readLogo(data, "logoLight", "removeLight", "light");
  if (typeof light === "string") return { ok: false, error: light };
  const dark = await readLogo(data, "logoDark", "removeDark", "dark");
  if (typeof dark === "string") return { ok: false, error: dark };

  const saved = await updatePage(id, user.id, {
    name: name === "" ? null : name,
    slug: slug.slug,
    logoUrl: link.url,
    buttonRadius: radius,
    features,
    theme,
    light,
    dark,
  });
  if (saved === "gone") return GONE;
  if (saved === "slug_taken") return { ok: false, error: SLUG_TAKEN };

  revalidatePath(PATH, "layout");
  revalidatePath("/c", "layout");
  return { ok: true };
}

export type DomainOutcome =
  | { ok: true; host: string; state: DomainState; records: DnsRecord[] }
  | { ok: false; error: string };

function describeDomain(host: string, report: DomainReport): DomainOutcome {
  const active = report.verified && !report.misconfigured;
  return {
    ok: true,
    host,
    state: active ? "active" : "pending",
    records: active ? [] : dnsRecords(host, report.target, report.verified ? [] : report.challenges),
  };
}

export async function attachDomain(id: string, raw: string): Promise<DomainOutcome> {
  const { user } = await requireSession();
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return GONE;

  const checked = checkDomain(raw);
  if (!checked.ok) return checked;
  if (!domainsConfigured()) return { ok: false, error: "Custom domains aren't switched on for this deployment yet." };

  const claimed = await claimDomain(id, user.id, checked.host);
  if (claimed === "gone") return GONE;
  if (claimed === "taken") return { ok: false, error: "That domain is already used by another page." };
  if (claimed === "has_domain") return { ok: false, error: "This page already has a domain. Remove it first." };

  const added = await addDomain(checked.host);
  if (!added.ok) {
    await releaseDomain(id, user.id);
    return added;
  }
  const outcome = describeDomain(checked.host, added.report);
  if (outcome.ok && outcome.state === "active") await setDomainVerified(id, user.id, checked.host, true);
  revalidatePath(PATH, "layout");
  return outcome;
}

export async function refreshDomain(id: string): Promise<DomainOutcome> {
  const { user } = await requireSession();
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return GONE;

  const page = await findOwnedPage(id, user.id);
  if (!page) return GONE;
  if (!page.domain) return { ok: false, error: "This page has no domain yet." };

  const read = await readDomain(page.domain);
  if (!read.ok) return read;
  const outcome = describeDomain(page.domain, read.report);
  if (outcome.ok) {
    await setDomainVerified(id, user.id, page.domain, outcome.state === "active");
    revalidatePath(PATH, "layout");
  }
  return outcome;
}

export async function detachDomain(id: string): Promise<PageOutcome> {
  const { user } = await requireSession();
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return GONE;

  const host = await releaseDomain(id, user.id);
  if (host) await removeDomain(host);
  revalidatePath(PATH, "layout");
  return host ? { ok: true } : { ok: false, error: "This page has no domain." };
}

export async function removePage(id: string): Promise<PageOutcome> {
  const { user } = await requireSession();
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return GONE;
  const owned = await findOwnedPage(id, user.id);
  if (!owned) return GONE;
  if (owned.domain) await removeDomain(owned.domain);
  if (!(await deletePage(id, user.id))) return GONE;
  if (owned.domain) forgetHost(owned.domain);
  revalidatePath(PATH, "layout");
  revalidatePath("/c", "layout");
  return { ok: true };
}

export type KeyOutcome = { ok: true; key: string } | { ok: false; error: string };

export async function generatePageKey(id: string): Promise<KeyOutcome> {
  const { user } = await requireSession();
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return { ok: false, error: "That page doesn't exist anymore." };
  const key = await issuePageKey(id, user.id);
  if (!key) return { ok: false, error: "That page doesn't exist anymore." };
  revalidatePath(PATH, "layout");
  return { ok: true, key };
}
