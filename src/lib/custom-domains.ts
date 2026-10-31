import { db } from "./db";
import type { DomainState } from "./domain-settings";

const HOST_TTL_MS = 30_000;

const hosts = new Map<string, { slug: string | null; until: number }>();

export function forgetHost(host: string) {
  hosts.delete(host);
}

export async function slugForHost(host: string): Promise<string | null> {
  const known = hosts.get(host);
  if (known && known.until > Date.now()) return known.slug;
  const [row] = await db()<{ slug: string }[]>`
    select slug from public.custom_pages
    where custom_domain = ${host} and domain_verified_at is not null
  `;
  hosts.set(host, { slug: row?.slug ?? null, until: Date.now() + HOST_TTL_MS });
  return row?.slug ?? null;
}

export function stateOf(page: { domain: string | null; domainVerifiedAt: Date | null }): DomainState | null {
  if (!page.domain) return null;
  return page.domainVerifiedAt ? "active" : "pending";
}

export async function claimDomain(pageId: string, userId: string, host: string): Promise<"ok" | "gone" | "taken" | "has_domain"> {
  try {
    const rows = await db()<{ id: string }[]>`
      update public.custom_pages
      set custom_domain = ${host}, domain_added_at = now(), domain_verified_at = null
      where id = ${pageId} and user_id = ${userId} and custom_domain is null
      returning id
    `;
    if (rows.length > 0) return "ok";
    const [row] = await db()<{ id: string }[]>`
      select id from public.custom_pages where id = ${pageId} and user_id = ${userId}
    `;
    return row ? "has_domain" : "gone";
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return "taken";
    throw error;
  }
}

export async function setDomainVerified(pageId: string, userId: string, host: string, active: boolean): Promise<boolean> {
  const rows = await db()<{ id: string }[]>`
    update public.custom_pages
    set domain_verified_at = ${active ? new Date() : null}
    where id = ${pageId} and user_id = ${userId} and custom_domain = ${host}
    returning id
  `;
  forgetHost(host);
  return rows.length > 0;
}

export async function releaseDomain(pageId: string, userId: string): Promise<string | null> {
  const [row] = await db()<{ host: string | null }[]>`
    update public.custom_pages p
    set custom_domain = null, domain_added_at = null, domain_verified_at = null
    from (
      select id, custom_domain from public.custom_pages where id = ${pageId} and user_id = ${userId}
    ) old
    where p.id = old.id
    returning old.custom_domain as host
  `;
  if (row?.host) forgetHost(row.host);
  return row?.host ?? null;
}
