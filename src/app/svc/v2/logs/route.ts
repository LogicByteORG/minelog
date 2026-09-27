import type { NextRequest } from "next/server";
import { readBodyText } from "@/lib/service/body";
import { describeV2Created } from "@/lib/service/describe";
import { queryFlag } from "@/lib/service/fields";
import { json, preflight, v2Error, v2Failure } from "@/lib/service/respond";
import { uploadLog } from "@/lib/service/upload";

export const OPTIONS = preflight;

export async function POST(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  try {
    const text = await readBodyText(request);
    const isJson = (request.headers.get("content-type") ?? "")
      .toLowerCase()
      .includes("json");

    let content: unknown = text;
    let hidePrivate: unknown;
    let source: unknown;

    if (isJson) {
      let payload: unknown;
      try {
        payload = JSON.parse(text);
      } catch {
        return v2Error(400, "invalid_body", 'Send JSON like {"content": "..."}.');
      }
      if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
        return v2Error(400, "invalid_body", 'Send JSON like {"content": "..."}.');
      }
      ({ content, hidePrivate, source } = payload as Record<string, unknown>);
    }

    hidePrivate ??= queryFlag(query.get("hidePrivate"));
    source ??= query.get("source") ?? undefined;

    const saved = await uploadLog({ content, hidePrivate, source, request });
    return json(describeV2Created(saved, request), 201);
  } catch (error) {
    return v2Failure(error);
  }
}

