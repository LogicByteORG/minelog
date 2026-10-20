"use server";

import { revalidatePath } from "next/cache";
import { listServers } from "@/lib/api-keys";
import { WEBHOOKS_PER_ACCOUNT, WEBHOOK_TESTS_PER_MINUTE } from "@/lib/config";
import { normalizeHandle } from "@/lib/handle";
import { ID_PATTERN, cleanLabel, sameName, uniqueName } from "@/lib/label";
import { takeHit } from "@/lib/service/limiter";
import { requireSession } from "@/lib/session";
import { KIND_LABEL, detectWebhook } from "@/lib/webhook-url";
import {
  NAME_MAX,
  createWebhook,
  deleteWebhook,
  listWebhooks,
  sendTest,
  updateWebhook,
} from "@/lib/webhooks";

const PATH = "/dash/webhooks";

export type WebhookOutcome = { ok: true } | { ok: false; error: string };

const GONE: WebhookOutcome = { ok: false, error: "That webhook doesn't exist anymore." };

const TOO_LONG = `Use ${NAME_MAX} characters or fewer for the name.`;

const BAD_HANDLE = "Use lowercase letters, numbers and dashes for the handle, up to 32 characters.";

const TAKEN = "You already have a webhook with that handle.";

const nameTaken = (name: string) => `You already have a webhook called “${name}”. Pick another name.`;

type Scope = { ok: true; ids: string[] | null } | { ok: false; error: string };

async function readScope(userId: string, raw: unknown): Promise<Scope> {
  if (raw === undefined || raw === null) return { ok: true, ids: null };
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "Pick at least one server." };
  }
  const mine = new Set((await listServers(userId)).map((server) => server.id));
  const ids: string[] = [];
  for (const value of raw) {
    if (typeof value !== "string" || !mine.has(value)) {
      return { ok: false, error: "One of those servers doesn't exist anymore." };
    }
    if (!ids.includes(value)) ids.push(value);
  }
  return { ok: true, ids };
}

export async function addWebhook(input: {
  url: string;
  name: string;
  handle?: string;
  serverIds?: string[] | null;
}): Promise<WebhookOutcome> {
  const { user } = await requireSession();

  const detected = detectWebhook(typeof input?.url === "string" ? input.url : "");
  if (!detected.ok) return { ok: false, error: detected.error };

  const label = cleanLabel(input?.name, NAME_MAX);
  if (label === null) return { ok: false, error: TOO_LONG };

  let handle: string | undefined;
  if (typeof input?.handle === "string" && input.handle.trim() !== "") {
    const clean = normalizeHandle(input.handle);
    if (!clean) return { ok: false, error: BAD_HANDLE };
    handle = clean;
  }

  const scope = await readScope(user.id, input?.serverIds);
  if (!scope.ok) return scope;

  const existing = (await listWebhooks(user.id)).map((hook) => hook.name);
  if (label && existing.some((other) => sameName(other, label))) {
    return { ok: false, error: nameTaken(label) };
  }
  const name = label || uniqueName(KIND_LABEL[detected.kind], existing);

  const created = await createWebhook(user.id, {
    name,
    handle,
    kind: detected.kind,
    url: detected.url,
    hint: detected.hint,
    serverIds: scope.ids,
  });
  if (!created.ok) {
    return {
      ok: false,
      error:
        created.error === "name_taken"
          ? nameTaken(name)
          : created.error === "handle_taken"
            ? TAKEN
            : `You can add up to ${WEBHOOKS_PER_ACCOUNT} webhooks. Remove one first.`,
    };
  }

  revalidatePath(PATH);
  return { ok: true };
}

export async function changeWebhook(
  id: string,
  changes: { name?: string; handle?: string; enabled?: boolean; serverIds?: string[] | null },
): Promise<WebhookOutcome> {
  const { user } = await requireSession();
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return GONE;

  let name: string | undefined;
  if (changes?.name !== undefined) {
    const label = cleanLabel(changes.name, NAME_MAX);
    if (label === null) return { ok: false, error: TOO_LONG };
    if (label === "") return { ok: false, error: "Give the webhook a name." };
    const others = await listWebhooks(user.id);
    if (others.some((hook) => hook.id !== id && sameName(hook.name, label))) {
      return { ok: false, error: nameTaken(label) };
    }
    name = label;
  }

  let handle: string | undefined;
  if (changes?.handle !== undefined) {
    const clean = normalizeHandle(changes.handle);
    if (!clean) return { ok: false, error: BAD_HANDLE };
    handle = clean;
  }

  let serverIds: string[] | null | undefined;
  if (changes?.serverIds !== undefined) {
    const scope = await readScope(user.id, changes.serverIds);
    if (!scope.ok) return scope;
    serverIds = scope.ids;
  }

  const enabled = typeof changes?.enabled === "boolean" ? changes.enabled : undefined;

  const result = await updateWebhook(user.id, id, { name, handle, enabled, serverIds });
  if (result === "gone") return GONE;
  if (result === "handle_taken") return { ok: false, error: TAKEN };
  if (result === "name_taken") return { ok: false, error: nameTaken(name ?? "that name") };

  revalidatePath(PATH);
  return { ok: true };
}

export async function removeWebhook(id: string): Promise<WebhookOutcome> {
  const { user } = await requireSession();
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return GONE;
  if (!(await deleteWebhook(user.id, id))) return GONE;
  revalidatePath(PATH);
  return { ok: true };
}

export async function testWebhook(id: string): Promise<WebhookOutcome> {
  const { user } = await requireSession();
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return GONE;

  const hit = takeHit(`webhook-test:${user.id}`, WEBHOOK_TESTS_PER_MINUTE);
  if (!hit.ok) {
    return { ok: false, error: `Slow down a little. Try again in ${hit.retryAfter} seconds.` };
  }

  const result = await sendTest(user.id, id);
  revalidatePath(PATH);
  if (result === null) return GONE;
  if (!result.ok) return { ok: false, error: result.error };
  if (result.status >= 200 && result.status < 300) return { ok: true };
  return { ok: false, error: `The other side answered HTTP ${result.status}.` };
}
