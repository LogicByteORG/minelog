import type { NextRequest } from "next/server";
import { readBodyText } from "@/lib/service/body";
import { describeCompatCreated } from "@/lib/service/describe";
import { compatError, compatFailure, json, preflight } from "@/lib/service/respond";
import { uploadLog } from "@/lib/service/upload";

export const OPTIONS = preflight;

export async function POST(request: NextRequest) {
  try {
    const text = await readBodyText(request);
    const type = (request.headers.get("content-type") ?? "").toLowerCase();

    let content: unknown;
    let source: unknown;
    if (type.includes("json")) {
      let payload: unknown;
      try {
        payload = JSON.parse(text);
      } catch {
        return compatError(400, "The request body isn't valid JSON.");
      }
      if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
        return compatError(400, "The request body isn't valid JSON.");
      }
      ({ content, source } = payload as Record<string, unknown>);
    } else {
      const form = new URLSearchParams(text);
      content = form.get("content") ?? undefined;
      source = form.get("source") ?? undefined;
    }

    const saved = await uploadLog({ content, hidePrivate: undefined, source, request });
    return json(describeCompatCreated(saved, request));
  } catch (error) {
    return compatFailure(error);
  }
}

