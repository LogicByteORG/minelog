import type { NextRequest } from "next/server";
import { analyseText, readAnalyseBody } from "@/lib/service/analyse";
import { describeV2Insights } from "@/lib/service/describe-insights";
import { queryFlag, readFields } from "@/lib/service/fields";
import { json, preflight, v2Error, v2Failure } from "@/lib/service/respond";

export const OPTIONS = preflight;

export async function POST(request: NextRequest) {
  try {
    const text = await readAnalyseBody(request);
    const type = request.headers.get("content-type") ?? "";

    let content: unknown = text;
    let hidePrivate: unknown;

    if (type.toLowerCase().includes("json")) {
      const fields = readFields(text, type);
      if (!fields) return v2Error(400, "invalid_body", 'Send JSON like {"content": "..."}.');
      ({ content, hidePrivate } = fields);
    }

    hidePrivate ??= queryFlag(request.nextUrl.searchParams.get("hidePrivate"));

    return json(describeV2Insights(analyseText({ content, hidePrivate })));
  } catch (error) {
    return v2Failure(error);
  }
}

