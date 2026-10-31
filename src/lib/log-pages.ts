import { createHash, randomBytes } from "node:crypto";
import { PAGES_PER_ACCOUNT } from "./config";
import { db } from "./db";
import {
  readFeatures,
  readTheme,
  type LogoType,
  type PageFeatures,
  type PageTheme,
} from "./page-settings";

export type PageRow = {
  id: string;
  userId: string;
  slug: string;
  name: string | null;
  logoLightId: string | null;
  logoDarkId: string | null;
  logoUrl: string | null;
  buttonRadius: number;
  features: PageFeatures;
  theme: PageTheme;
  keyPrefix: string | null;
  keyCreatedAt: Date | null;
  domain: string | null;
  domainVerifiedAt: Date | null;
  updatedAt: Date;
};

type Raw = Omit<PageRow, "features" | "theme"> & { features: unknown; theme: unknown };

// Never selects the image bytes, those only leave the database through `findLogo`.
const COLUMNS = `
  id, user_id, slug, name, logo_url, logo_light_id, logo_dark_id, button_radius, features, theme,
  updated_at, api_key_prefix as key_prefix, api_key_created_at as key_created_at,
  custom_domain as domain, domain_verified_at
`;

function shape(row: Raw): PageRow {
  return { ...row, features: readFeatures(row.features), theme: readTheme(row.theme) };
}

export async function listPages(userId: string): Promise<PageRow[]> {
  const rows = await db().unsafe<Raw[]>(
    `select ${COLUMNS} from public.custom_pages where user_id = $1 order by created_at`,
    [userId],
  );
  return rows.map(shape);
}

export async function findOwnedPage(id: string, userId: string): Promise<PageRow | null> {
  const [row] = await db().unsafe<Raw[]>(
    `select ${COLUMNS} from public.custom_pages where id = $1 and user_id = $2`,
    [id, userId],
  );
  return row ? shape(row) : null;
}

export async function findPageBySlug(slug: string): Promise<PageRow | null> {
  const [row] = await db().unsafe<Raw[]>(
    `select ${COLUMNS} from public.custom_pages where slug = $1`,
    [slug],
  );
  return row ? shape(row) : null;
}

export async function findLogo(
  userId: string,
  pageId: string,
  imageId: string,
): Promise<{ bytes: Buffer; type: LogoType } | null> {
  const [row] = await db()<{ bytes: Buffer; type: LogoType }[]>`
    select
      case when logo_light_id = ${imageId} then logo_light else logo_dark end as bytes,
      case when logo_light_id = ${imageId} then logo_light_type else logo_dark_type end as type
    from public.custom_pages
    where user_id = ${userId} and id = ${pageId}
      and (logo_light_id = ${imageId} or logo_dark_id = ${imageId})
  `;
  return row?.bytes && row.type ? row : null;
}

export type CreateResult = { ok: true; id: string } | { ok: false; reason: "slug_taken" | "limit" };

export async function createPage(userId: string, slug: string): Promise<CreateResult> {
  const [count] = await db()<{ total: number }[]>`
    select count(*)::int as total from public.custom_pages where user_id = ${userId}
  `;
  if ((count?.total ?? 0) >= PAGES_PER_ACCOUNT) return { ok: false, reason: "limit" };
  try {
    const [row] = await db()<{ id: string }[]>`
      insert into public.custom_pages (user_id, slug)
      values (${userId}, ${slug})
      returning id
    `;
    return { ok: true, id: row.id };
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return { ok: false, reason: "slug_taken" };
    throw error;
  }
}

export type LogoChange =
  | { kind: "keep" }
  | { kind: "remove" }
  | { kind: "set"; bytes: Buffer; type: LogoType };

export type PageUpdate = {
  name: string | null;
  slug: string;
  logoUrl: string | null;
  buttonRadius: number;
  features: PageFeatures;
  theme: PageTheme;
  light: LogoChange;
  dark: LogoChange;
};

export async function updatePage(
  id: string,
  userId: string,
  change: PageUpdate,
): Promise<"ok" | "gone" | "slug_taken"> {
  const sql = db();
  const logo = (side: "light" | "dark", logoChange: LogoChange) => {
    const bytes = sql(`logo_${side}`);
    const type = sql(`logo_${side}_type`);
    const image = sql(`logo_${side}_id`);
    if (logoChange.kind === "set") {
      const id = randomBytes(10).toString("hex");
      return sql`${bytes} = ${logoChange.bytes}, ${type} = ${logoChange.type}, ${image} = ${id}`;
    }
    if (logoChange.kind === "remove") return sql`${bytes} = null, ${type} = null, ${image} = null`;
    return sql`${bytes} = ${bytes}, ${type} = ${type}, ${image} = ${image}`;
  };

  try {
    const rows = await sql<{ id: string }[]>`
      update public.custom_pages set
        name = ${change.name},
        slug = ${change.slug},
        logo_url = ${change.logoUrl},
        button_radius = ${change.buttonRadius},
        features = ${sql.json(change.features)},
        theme = ${sql.json(change.theme)},
        ${logo("light", change.light)},
        ${logo("dark", change.dark)},
        updated_at = now()
      where id = ${id} and user_id = ${userId}
      returning id
    `;
    return rows.length > 0 ? "ok" : "gone";
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return "slug_taken";
    throw error;
  }
}

export async function deletePage(id: string, userId: string): Promise<boolean> {
  const rows = await db()<{ id: string }[]>`
    delete from public.custom_pages where id = ${id} and user_id = ${userId} returning id
  `;
  return rows.length > 0;
}

// A log only opens under the page it was saved to.
export async function logBelongsToPage(logId: string, pageId: string): Promise<boolean> {
  const [row] = await db()<{ id: string }[]>`
    select id from public.logs where id = ${logId} and custom_page_id = ${pageId}
  `;
  return Boolean(row);
}

export type PageCard = PageRow & { logCount: number; lastLogAt: Date | null };

export async function listPageCards(userId: string): Promise<PageCard[]> {
  const rows = await db().unsafe<(Raw & { logCount: number; lastLogAt: Date | null })[]>(
    `select ${COLUMNS},
       (select count(*)::int from public.logs l where l.custom_page_id = p.id and l.expires_at > now()) as log_count,
       (select max(created_at) from public.logs l where l.custom_page_id = p.id) as last_log_at
     from public.custom_pages p where user_id = $1 order by created_at`,
    [userId],
  );
  return rows.map((row) => ({ ...shape(row), logCount: row.logCount, lastLogAt: row.lastLogAt }));
}

const KEY_PATTERN = /^mlp_[A-Za-z0-9_-]{32}$/;

const hashKey = (key: string) => createHash("sha256").update(key).digest("hex");

export function pageKeyFromRequest(request: Request): string | null {
  const match = /^Bearer\s+(\S+)\s*$/i.exec(request.headers.get("authorization") ?? "");
  return match && KEY_PATTERN.test(match[1]) ? match[1] : null;
}

// The key is shown once. Only its hash is kept, so a new key replaces the old one.
export async function issuePageKey(id: string, userId: string): Promise<string | null> {
  const key = `mlp_${randomBytes(24).toString("base64url")}`;
  const rows = await db()<{ id: string }[]>`
    update public.custom_pages
    set api_key_hash = ${hashKey(key)}, api_key_prefix = ${key.slice(0, 8)}, api_key_created_at = now()
    where id = ${id} and user_id = ${userId}
    returning id
  `;
  return rows.length > 0 ? key : null;
}

export async function findPageByKey(key: string): Promise<PageRow | null> {
  const [row] = await db().unsafe<Raw[]>(
    `select ${COLUMNS} from public.custom_pages where api_key_hash = $1`,
    [hashKey(key)],
  );
  return row ? shape(row) : null;
}
