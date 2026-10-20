import { after, type NextRequest } from "next/server";
import { alertFingerprint, summaryOf, SUMMARY_MAX } from "@/lib/alert-fingerprint";
import { parseTargets } from "@/lib/event-input";
import { recordAlert } from "@/lib/alerts";
import { authenticateKey } from "@/lib/api-keys";
import { ALERTS_PER_MINUTE, ALERT_CONTENT_MAX } from "@/lib/config";
import { analyze } from "@/lib/log";
import { takeHit } from "@/lib/service/limiter";
import { json, preflight, v2Error } from "@/lib/service/respond";
import { availableHandles, deliverTo, resolveTargets } from "@/lib/webhooks";

export const OPTIONS = preflight;

const NO_STORE = { "Cache-Control": "no-store" };

const BODY_MAX = ALERT_CONTENT_MAX * 2;

const LINES_MAX = 800;

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

  const hit = takeHit(`alerts:${owner.id}`, ALERTS_PER_MINUTE);
  if (!hit.ok) {
    return v2Error(429, "rate_limited", `This server sent more than ${ALERTS_PER_MINUTE} alerts in a minute.`, {
      "Retry-After": String(hit.retryAfter),
    });
  }

  const raw = await request.text();
  if (raw.length > BODY_MAX) return v2Error(413, "too_large", "That alert is too large.", NO_STORE);

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return v2Error(400, "invalid_body", 'Send JSON like {"content": "..."}.', NO_STORE);
  }

  const body = (payload ?? {}) as { content?: unknown; title?: unknown; webhooks?: unknown };
  if (typeof body.content !== "string" || body.content.trim().length === 0) {
    return v2Error(400, "empty_content", "There is no log text in this alert.", NO_STORE);
  }
  if (body.title !== undefined && typeof body.title !== "string") {
    return v2Error(400, "invalid_field", "title must be text.", NO_STORE);
  }

  const wanted = parseTargets(body.webhooks);
  if (!wanted.ok) return v2Error(400, "invalid_field", wanted.message, NO_STORE);
  const resolved = await resolveTargets(owner.userId, owner.id, wanted.handles);
  if (resolved.unknown.length > 0) {
    const known = await availableHandles(owner.userId);
    return v2Error(
      400,
      "unknown_webhook",
      `No webhook with the handle ${resolved.unknown.join(", ")}. Yours: ${known.join(", ") || "none yet"}.`,
      NO_STORE,
    );
  }

  const trimmed = body.content
    .replaceAll("\u0000", "")
    .split(/\r?\n/)
    .slice(0, LINES_MAX)
    .join("\n")
    .slice(0, ALERT_CONTENT_MAX);
  const content = analyze(trimmed, true).output;

  const summary = (typeof body.title === "string" && body.title.trim()
    ? body.title.trim().replace(/\s+/g, " ").slice(0, SUMMARY_MAX)
    : summaryOf(content)) || "Error";

  const recorded = await recordAlert({
    userId: owner.userId,
    serverId: owner.id,
    serverName: owner.name,
    fingerprint: alertFingerprint(content),
    summary,
    content,
  });

  if (recorded.isNew && resolved.targets.length > 0) {
    after(async () => {
      try {
        await deliverTo(resolved.targets, {
          event: "error",
          level: "error",
          title: "Error detected",
          message: summary.slice(0, 300),
          fields: [],
          occurredAt: new Date(),
          serverName: owner.name,
        });
      } catch (error) {
        console.error("Delivering an alert to webhooks failed:", error);
      }
    });
  }

  return json(
    { id: recorded.id, occurrences: recorded.occurrences, new: recorded.isNew },
    recorded.isNew ? 201 : 200,
    NO_STORE,
  );
}
