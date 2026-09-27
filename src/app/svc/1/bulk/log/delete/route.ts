import type { NextRequest } from "next/server";
import { BULK_DELETES_PER_MINUTE, BULK_DELETE_LIMIT } from "@/lib/config";
import { readBodyText } from "@/lib/service/body";
import { DeleteError, deleteLogWithToken, tooManyDeletes } from "@/lib/service/delete";
import { waitFor } from "@/lib/service/rate";
import { compatError, compatFailure, json, preflight } from "@/lib/service/respond";

export const OPTIONS = preflight;

type Target = { id: string; token: string };

const PARALLEL = 16;

function readTargets(payload: unknown): Target[] | string {
  if (!Array.isArray(payload)) return "Send a JSON list of { id, token } objects.";
  if (payload.length === 0) return "No logs provided.";
  if (payload.length > BULK_DELETE_LIMIT) {
    return `Too many logs. You can delete up to ${BULK_DELETE_LIMIT} at once.`;
  }

  const targets: Target[] = [];
  for (const item of payload) {
    const { id, token } = (item ?? {}) as Record<string, unknown>;
    if (typeof id !== "string" || typeof token !== "string" || !id || !token) {
      return "Every entry needs an id and a token.";
    }
    targets.push({ id, token });
  }
  return targets;
}

async function deleteOne({ id, token }: Target) {
  try {
    await deleteLogWithToken(id, token);
    return { success: true, id, status: 200 };
  } catch (error) {
    if (error instanceof DeleteError) {
      return { success: false, error: error.message, id, status: error.status };
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const wait = waitFor(request, "bulk-delete", BULK_DELETES_PER_MINUTE);
    if (wait !== null) throw tooManyDeletes(wait);

    const text = await readBodyText(request);

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      return compatError(400, "The request body isn't valid JSON.");
    }

    const targets = readTargets(payload);
    if (typeof targets === "string") return compatError(400, targets);

    const results = [];
    for (let start = 0; start < targets.length; start += PARALLEL) {
      results.push(...(await Promise.all(targets.slice(start, start + PARALLEL).map(deleteOne))));
    }
    return json({ success: true, results }, 207);
  } catch (error) {
    return compatFailure(error);
  }
}

