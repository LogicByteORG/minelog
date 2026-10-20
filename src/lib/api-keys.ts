import { createHash, randomBytes } from "node:crypto";
import { SERVERS_PER_ACCOUNT } from "./config";
import { db } from "./db";
import { LABEL_MAX, uniqueName } from "./label";

export type ServerRow = {
  id: string;
  name: string;
  nameIsCustom: boolean;
  keyPrefix: string;
  software: string | null;
  softwareVersion: string | null;
  pluginVersion: string | null;
  createdAt: Date;
  lastSeenAt: Date | null;
};

export type ConnectInfo = {
  software: string | null;
  version: string | null;
  pluginVersion: string | null;
};

export type KeyOwner = { id: string; userId: string; name: string };

const KEY_PATTERN = /^mlk_[A-Za-z0-9_-]{32}$/;

const FALLBACK_NAME = "New server";

export const NAME_MAX = LABEL_MAX;

export type CreateServerResult = { key: string; id: string } | "limit" | "name_taken";

export type RenameServerResult = "ok" | "gone" | "name_taken";

function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: string }).code === "23505";
}

async function otherServerNames(userId: string, exceptId: string | null): Promise<string[]> {
  const rows = await db()<{ name: string }[]>`
    select name from public.api_keys
    where user_id = ${userId} and revoked_at is null and id is distinct from ${exceptId}::uuid
  `;
  return rows.map((row) => row.name);
}

export function generateKey(): { key: string; hash: string; prefix: string } {
  const key = `mlk_${randomBytes(24).toString("base64url")}`;
  return { key, hash: hashKey(key), prefix: key.slice(0, 8) };
}

export function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function looksLikeKey(value: string): boolean {
  return KEY_PATTERN.test(value);
}

export function keyFromRequest(request: Request): string | null {
  const match = /^Bearer\s+(\S+)\s*$/i.exec(request.headers.get("authorization") ?? "");
  return match && looksLikeKey(match[1]) ? match[1] : null;
}

export function autoServerName(info: ConnectInfo): string {
  const parts = [info.software, info.version].filter((part): part is string => Boolean(part));
  const name = parts.join(" ").trim();
  return name ? name.slice(0, NAME_MAX) : "Minecraft server";
}

export async function listServers(userId: string): Promise<ServerRow[]> {
  return db()<ServerRow[]>`
    select id, name, name_is_custom, key_prefix, software, software_version,
           plugin_version, created_at, last_seen_at
    from public.api_keys
    where user_id = ${userId} and revoked_at is null
    order by created_at
  `;
}

export async function createServer(userId: string, name: string | null): Promise<CreateServerResult> {
  const { key, hash, prefix } = generateKey();
  const custom = name !== null && name.length > 0;
  const shown = custom ? name : uniqueName(FALLBACK_NAME, await otherServerNames(userId, null));
  try {
    const [row] = await db()<{ id: string }[]>`
      insert into public.api_keys (user_id, name, name_is_custom, key_hash, key_prefix)
      select ${userId}, ${shown}, ${custom}, ${hash}, ${prefix}
      where (
        select count(*) from public.api_keys where user_id = ${userId} and revoked_at is null
      ) < ${SERVERS_PER_ACCOUNT}
      returning id
    `;
    return row ? { key, id: row.id } : "limit";
  } catch (error) {
    if (isUniqueViolation(error)) return "name_taken";
    throw error;
  }
}

export async function renameServer(userId: string, id: string, name: string): Promise<RenameServerResult> {
  try {
    const rows = await db()<{ id: string }[]>`
      update public.api_keys
      set name = ${name}, name_is_custom = true
      where id = ${id} and user_id = ${userId} and revoked_at is null
      returning id
    `;
    return rows.length > 0 ? "ok" : "gone";
  } catch (error) {
    if (isUniqueViolation(error)) return "name_taken";
    throw error;
  }
}

export async function revokeServer(userId: string, id: string): Promise<boolean> {
  const rows = await db()<{ id: string }[]>`
    update public.api_keys
    set revoked_at = now()
    where id = ${id} and user_id = ${userId} and revoked_at is null
    returning id
  `;
  return rows.length > 0;
}

export async function authenticateKey(request: Request): Promise<KeyOwner | null> {
  const key = keyFromRequest(request);
  if (!key) return null;
  const [row] = await db()<KeyOwner[]>`
    update public.api_keys
    set last_seen_at = now()
    where key_hash = ${hashKey(key)} and revoked_at is null
    returning id, user_id, name
  `;
  return row ?? null;
}

export async function recordConnection(id: string, info: ConnectInfo): Promise<string> {
  const [owner] = await db()<{ userId: string }[]>`select user_id from public.api_keys where id = ${id}`;
  const name = owner
    ? uniqueName(autoServerName(info), await otherServerNames(owner.userId, id))
    : autoServerName(info);
  const [row] = await db()<{ name: string }[]>`
    update public.api_keys
    set software = ${info.software},
        software_version = ${info.version},
        plugin_version = ${info.pluginVersion},
        last_seen_at = now(),
        name = case when name_is_custom then name else ${name} end
    where id = ${id}
    returning name
  `;
  return row?.name ?? name;
}
