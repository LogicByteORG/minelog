"use server";

import { revalidatePath } from "next/cache";
import { NAME_MAX, createServer, renameServer, revokeServer } from "@/lib/api-keys";
import { SERVERS_PER_ACCOUNT } from "@/lib/config";
import { ID_PATTERN, cleanLabel } from "@/lib/label";
import { requireSession } from "@/lib/session";

const PATH = "/dash/servers";

export type ServerOutcome = { ok: true } | { ok: false; error: string };

export type CreatedOutcome = { ok: true; key: string } | { ok: false; error: string };

const GONE: ServerOutcome = { ok: false, error: "That server doesn't exist anymore." };

const nameTaken = (name: string) => `You already have a server called “${name}”. Pick another name.`;

const TOO_LONG = `Use ${NAME_MAX} characters or fewer for the name.`;

export async function addServer(name: string): Promise<CreatedOutcome> {
  const { user } = await requireSession();

  const label = cleanLabel(name, NAME_MAX);
  if (label === null) return { ok: false, error: TOO_LONG };

  const created = await createServer(user.id, label || null);
  if (created === "name_taken") return { ok: false, error: nameTaken(label) };
  if (created === "limit") {
    return {
      ok: false,
      error: `You can connect up to ${SERVERS_PER_ACCOUNT} servers. Remove one first.`,
    };
  }

  revalidatePath(PATH);
  return { ok: true, key: created.key };
}

export async function renameServerAction(id: string, name: string): Promise<ServerOutcome> {
  const { user } = await requireSession();
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return GONE;

  const label = cleanLabel(name, NAME_MAX);
  if (label === null) return { ok: false, error: TOO_LONG };
  if (label === "") return { ok: false, error: "Give the server a name." };

  const renamed = await renameServer(user.id, id, label);
  if (renamed === "gone") return GONE;
  if (renamed === "name_taken") return { ok: false, error: nameTaken(label) };
  revalidatePath(PATH);
  return { ok: true };
}

export async function removeServer(id: string): Promise<ServerOutcome> {
  const { user } = await requireSession();
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return GONE;
  if (!(await revokeServer(user.id, id))) return GONE;
  revalidatePath(PATH);
  return { ok: true };
}
