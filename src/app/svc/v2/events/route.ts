import { after, type NextRequest } from "next/server";
import { authenticateKey } from "@/lib/api-keys";
import { EVENTS_PER_MINUTE } from "@/lib/config";
import { MAX_BODY_CHARS, parseEventInput, parseTargets } from "@/lib/event-input";
import { takeHit } from "@/lib/service/limiter";
import { json, preflight, v2Error } from "@/lib/service/respond";
import { availableHandles, deliverTo, resolveTargets } from "@/lib/webhooks";

export const OPTIONS = preflight;

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  const owner = await authenticateKey(request);
  if (!owner) {
    return v2Error(
      401,
      "invalid_key",
      "That API key isn't valid. Create a new one in the Servers tab of your minelog dashboard.",
      NO_STORE,
    );
  }

  const hit = takeHit(`events:${owner.id}`, EVENTS_PER_MINUTE);
  if (!hit.ok) {
    return v2Error(429, "rate_limited", `This server sent more than ${EVENTS_PER_MINUTE} events in a minute.`, {
      "Retry-After": String(hit.retryAfter),
    });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_CHARS) {
    return v2Error(413, "too_large", "That event is too large.", NO_STORE);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return v2Error(400, "invalid_body", 'Send JSON like {"event": "tps"}.', NO_STORE);
  }

  const parsed = parseEventInput(payload, owner.name);
  if (!parsed.ok) return v2Error(400, parsed.code, parsed.message, NO_STORE);

  const targets = parseTargets((payload as { webhooks?: unknown }).webhooks);
  if (!targets.ok) return v2Error(400, "invalid_field", targets.message, NO_STORE);

  const resolved = await resolveTargets(owner.userId, owner.id, targets.handles);
  if (resolved.unknown.length > 0) {
    const known = await availableHandles(owner.userId, owner.id);
    return v2Error(
      400,
      "unknown_webhook",
      `No webhook with the handle ${resolved.unknown.join(", ")} is open to this server. This server can use: ${known.join(", ") || "none yet"}.`,
      NO_STORE,
    );
  }

  if (resolved.targets.length > 0) {
    after(async () => {
      try {
        await deliverTo(resolved.targets, parsed.event);
      } catch (error) {
        console.error("Delivering an event failed:", error);
      }
    });
  }

  return json({ accepted: true, webhooks: resolved.targets.length }, 202, NO_STORE);
}
