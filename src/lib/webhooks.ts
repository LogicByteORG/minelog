import { WEBHOOKS_PER_ACCOUNT, WEBHOOK_MAX_FAILURES } from "./config";
import { db } from "./db";
import { handleFromName, uniqueHandle } from "./handle";
import { LABEL_MAX } from "./label";
import { postJson, type PostResult } from "./safe-post";
import { open, seal } from "./vault";
import { buildPayload, prepareRequest, type OutgoingEvent } from "./webhook-format";
import type { WebhookKind } from "./webhook-url";

export type WebhookRow = {
  id: string;
  name: string;
  handle: string;
  kind: WebhookKind;
  urlHint: string;
  serverIds: string[] | null;
  enabled: boolean;
  failureCount: number;
  lastStatus: "ok" | "failed" | null;
  lastAttemptAt: Date | null;
  lastError: string | null;
  createdAt: Date;
};

export type NewWebhook = {
  name: string;
  handle?: string;
  kind: WebhookKind;
  url: string;
  hint: string;
  serverIds: string[] | null;
};

export type WebhookChanges = {
  name?: string;
  handle?: string;
  enabled?: boolean;
  serverIds?: string[] | null;
};

export type CreateResult =
  | { ok: true; id: string }
  | { ok: false; error: "limit" | "handle_taken" | "name_taken" };

export type UpdateResult = "ok" | "gone" | "handle_taken" | "name_taken";

export type Target = { id: string; kind: WebhookKind; urlEncrypted: string };

export type Sender = (url: string, body: unknown, headers: Record<string, string>) => Promise<PostResult>;

export const NAME_MAX = LABEL_MAX;

const defaultSender: Sender = (url, body, headers) => postJson(url, body, { headers });

function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: string }).code === "23505";
}

function violatedName(error: unknown): boolean {
  return ((error as { constraint_name?: string }).constraint_name ?? "").includes("name");
}

export async function listWebhooks(userId: string): Promise<WebhookRow[]> {
  return db()<WebhookRow[]>`
    select id, name, handle, kind, url_hint, server_ids, enabled, failure_count,
           last_status, last_attempt_at, last_error, created_at
    from public.webhooks
    where user_id = ${userId}
    order by created_at
  `;
}

export async function createWebhook(userId: string, input: NewWebhook): Promise<CreateResult> {
  const handle =
    input.handle ??
    uniqueHandle(
      handleFromName(input.name),
      (await db()<{ handle: string }[]>`select handle from public.webhooks where user_id = ${userId}`).map(
        (row) => row.handle,
      ),
    );

  try {
    const [row] = await db()<{ id: string }[]>`
      insert into public.webhooks (user_id, name, handle, kind, url_encrypted, url_hint, server_ids)
      select ${userId}, ${input.name}, ${handle}, ${input.kind}, ${seal(input.url)}, ${input.hint},
             ${input.serverIds}::uuid[]
      where (select count(*) from public.webhooks where user_id = ${userId}) < ${WEBHOOKS_PER_ACCOUNT}
      returning id
    `;
    return row ? { ok: true, id: row.id } : { ok: false, error: "limit" };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: violatedName(error) ? "name_taken" : "handle_taken" };
    }
    throw error;
  }
}

export async function updateWebhook(
  userId: string,
  id: string,
  changes: WebhookChanges,
): Promise<UpdateResult> {
  try {
    const rows = await db()<{ id: string }[]>`
      update public.webhooks
      set name = coalesce(${changes.name ?? null}, name),
          handle = coalesce(${changes.handle ?? null}, handle),
          enabled = coalesce(${changes.enabled ?? null}, enabled),
          server_ids = case
            when ${changes.serverIds !== undefined} then ${changes.serverIds ?? null}::uuid[]
            else server_ids
          end,
          failure_count = case when ${changes.enabled === true} then 0 else failure_count end
      where id = ${id} and user_id = ${userId}
      returning id
    `;
    return rows.length > 0 ? "ok" : "gone";
  } catch (error) {
    if (isUniqueViolation(error)) return violatedName(error) ? "name_taken" : "handle_taken";
    throw error;
  }
}

export async function deleteWebhook(userId: string, id: string): Promise<boolean> {
  const rows = await db()<{ id: string }[]>`
    delete from public.webhooks where id = ${id} and user_id = ${userId} returning id
  `;
  return rows.length > 0;
}

export async function resolveTargets(
  userId: string,
  serverId: string,
  handles?: string[],
): Promise<{ targets: Target[]; unknown: string[] }> {
  if (handles && handles.length > 0) {
    const rows = await db()<(Target & { handle: string; enabled: boolean })[]>`
      select id, kind, url_encrypted, handle, enabled
      from public.webhooks
      where user_id = ${userId} and handle = any(${handles})
        and (server_ids is null or ${serverId}::uuid = any(server_ids))
    `;
    const known = new Set(rows.map((row) => row.handle));
    return {
      targets: rows.filter((row) => row.enabled),
      unknown: handles.filter((handle) => !known.has(handle)),
    };
  }

  const targets = await db()<Target[]>`
    select id, kind, url_encrypted
    from public.webhooks
    where user_id = ${userId}
      and enabled
      and (server_ids is null or ${serverId}::uuid = any(server_ids))
  `;
  return { targets, unknown: [] };
}

export async function availableHandles(userId: string, serverId: string): Promise<string[]> {
  const rows = await db()<{ handle: string }[]>`
    select handle from public.webhooks
    where user_id = ${userId}
      and (server_ids is null or ${serverId}::uuid = any(server_ids))
    order by created_at
  `;
  return rows.map((row) => row.handle);
}

function describeFailure(result: PostResult): { text: string; gone: boolean } {
  if (!result.ok) return { text: result.error.slice(0, 200), gone: false };
  const gone = result.status === 404 || result.status === 410;
  return {
    text: gone ? `The webhook no longer exists (HTTP ${result.status})` : `HTTP ${result.status}`,
    gone,
  };
}

async function record(id: string, result: PostResult): Promise<void> {
  if (result.ok && result.status >= 200 && result.status < 300) {
    await db()`
      update public.webhooks
      set last_status = 'ok', last_attempt_at = now(), last_error = null, failure_count = 0
      where id = ${id}
    `;
    return;
  }
  const failure = describeFailure(result);
  await db()`
    update public.webhooks
    set last_status = 'failed',
        last_attempt_at = now(),
        last_error = ${failure.text},
        failure_count = failure_count + 1,
        enabled = enabled and not ${failure.gone} and failure_count + 1 < ${WEBHOOK_MAX_FAILURES}
    where id = ${id}
  `;
}

async function sendTo(target: Target, event: OutgoingEvent, send: Sender): Promise<PostResult> {
  let url: string;
  try {
    url = open(target.urlEncrypted);
  } catch {
    return { ok: false, error: "Couldn't read the stored URL" };
  }
  const request = prepareRequest(target.kind, url, buildPayload(target.kind, event));
  return send(request.url, request.payload, { "x-minelog-event": event.event });
}

export async function deliverTo(
  targets: Target[],
  event: OutgoingEvent,
  send: Sender = defaultSender,
): Promise<void> {
  await Promise.all(
    targets.map(async (target) => {
      const result = await sendTo(target, event, send);
      await record(target.id, result);
    }),
  );
}

export async function sendTest(
  userId: string,
  id: string,
  send: Sender = defaultSender,
): Promise<PostResult | null> {
  const [target] = await db()<Target[]>`
    select id, kind, url_encrypted
    from public.webhooks
    where id = ${id} and user_id = ${userId}
  `;
  if (!target) return null;

  const result = await sendTo(
    target,
    {
      event: "custom",
      level: "info",
      title: "minelog test",
      message: "If you can read this, the webhook works.",
      fields: [],
      occurredAt: new Date(),
      serverName: "minelog",
    },
    send,
  );
  await record(id, result);
  return result;
}
