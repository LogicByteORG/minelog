import type { NextRequest } from "next/server";
import { authenticateKey, recordConnection } from "@/lib/api-keys";
import { EVENTS_PER_MINUTE } from "@/lib/config";
import { waitFor } from "@/lib/service/rate";
import { json, preflight, v2Error } from "@/lib/service/respond";
import { ALL_EVENT_IDS } from "@/lib/webhook-events";
import { listWebhooks } from "@/lib/webhooks";

export const OPTIONS = preflight;

const ATTEMPTS_PER_MINUTE = 30;

const NO_STORE = { "Cache-Control": "no-store" };

function short(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim().slice(0, 64);
  return clean.length > 0 ? clean : null;
}

export async function POST(request: NextRequest) {
  const wait = waitFor(request, "connect", ATTEMPTS_PER_MINUTE);
  if (wait !== null) {
    return v2Error(429, "rate_limited", "Too many attempts. Try again in a minute.", {
      "Retry-After": String(wait),
    });
  }

  const owner = await authenticateKey(request);
  if (!owner) {
    return v2Error(
      401,
      "invalid_key",
      "That API key isn't valid. Create a new one in the Servers tab of your minelog dashboard.",
      NO_STORE,
    );
  }

  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = await request.json();
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    body = {};
  }

  const name = await recordConnection(owner.id, {
    software: short(body.software),
    version: short(body.version),
    pluginVersion: short(body.pluginVersion),
  });

  const webhooks = (await listWebhooks(owner.userId)).map((hook) => ({
    handle: hook.handle,
    name: hook.name,
    kind: hook.kind,
    enabled: hook.enabled,
  }));

  return json(
    {
      server: { name },
      events: ALL_EVENT_IDS,
      webhooks,
      limits: { eventsPerMinute: EVENTS_PER_MINUTE },
    },
    200,
    NO_STORE,
  );
}
