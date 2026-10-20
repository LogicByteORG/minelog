import { normalizeHandle } from "./handle";
import { eventById, isLevel } from "./webhook-events";
import {
  FIELD_NAME_MAX,
  FIELD_VALUE_MAX,
  FIELDS_MAX,
  MESSAGE_MAX,
  TITLE_MAX,
  type EventField,
  type OutgoingEvent,
} from "./webhook-format";

export type EventInput =
  | { ok: true; event: OutgoingEvent }
  | { ok: false; code: "invalid_body" | "unknown_event" | "invalid_field"; message: string };

const MAX_BODY_CHARS = 16_384;

export { MAX_BODY_CHARS };

function text(value: unknown, max: number): string | null {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") return null;
  return value.trim().slice(0, max);
}

function scalar(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return String(value);
  return null;
}

function readFields(raw: unknown): EventField[] | null {
  if (raw === undefined || raw === null) return [];

  const pairs: [unknown, unknown][] = Array.isArray(raw)
    ? raw.map((entry) => {
        const item = entry as { name?: unknown; value?: unknown } | null;
        return [item?.name, item?.value];
      })
    : typeof raw === "object"
      ? Object.entries(raw as Record<string, unknown>)
      : [];

  if (!Array.isArray(raw) && typeof raw !== "object") return null;

  const fields: EventField[] = [];
  for (const [name, value] of pairs) {
    const label = typeof name === "string" ? name.trim().slice(0, FIELD_NAME_MAX) : "";
    const content = scalar(value)?.trim().slice(0, FIELD_VALUE_MAX);
    if (!label || content === undefined || content === "") return null;
    fields.push({ name: label, value: content });
    if (fields.length >= FIELDS_MAX) break;
  }
  return fields;
}

export function parseEventInput(payload: unknown, serverName: string, now = new Date()): EventInput {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, code: "invalid_body", message: 'Send JSON like {"event": "tps"}.' };
  }
  const body = payload as Record<string, unknown>;

  const known = typeof body.event === "string" ? eventById(body.event) : null;
  if (!known) {
    return {
      ok: false,
      code: "unknown_event",
      message: "Unknown event. Use error, tps, crash, start, stop or custom.",
    };
  }

  const title = text(body.title, TITLE_MAX);
  const message = text(body.message, MESSAGE_MAX);
  const fields = readFields(body.fields);
  if (title === null || message === null || fields === null) {
    return {
      ok: false,
      code: "invalid_field",
      message: "title and message must be text, and fields must be name and value pairs.",
    };
  }
  if (body.level !== undefined && !isLevel(body.level)) {
    return { ok: false, code: "invalid_field", message: "level must be info, warning or error." };
  }

  return {
    ok: true,
    event: {
      event: known.id,
      level: isLevel(body.level) ? body.level : known.level,
      title: title || known.label,
      message,
      fields,
      occurredAt: now,
      serverName,
    },
  };
}

export const TARGETS_MAX = 10;

export type TargetInput = { ok: true; handles: string[] | undefined } | { ok: false; message: string };

export function parseTargets(raw: unknown): TargetInput {
  if (raw === undefined || raw === null) return { ok: true, handles: undefined };

  const list = typeof raw === "string" ? [raw] : raw;
  if (!Array.isArray(list) || list.length === 0 || list.length > TARGETS_MAX) {
    return {
      ok: false,
      message: `webhooks must be one to ${TARGETS_MAX} handles, like ["ops-discord"].`,
    };
  }

  const handles: string[] = [];
  for (const value of list) {
    const handle = normalizeHandle(value);
    if (!handle) {
      return { ok: false, message: "A webhook handle uses lowercase letters, numbers and dashes, like ops-discord." };
    }
    if (!handles.includes(handle)) handles.push(handle);
  }
  return { ok: true, handles };
}
