import type { NextRequest } from "next/server";
import { analyseText, readAnalyseBody } from "@/lib/service/analyse";
import { describeCompatInsights } from "@/lib/service/describe-insights";
import { readFields } from "@/lib/service/fields";
import { compatError, compatFailure, json, preflight } from "@/lib/service/respond";

export const OPTIONS = preflight;

export async function POST(request: NextRequest) {
  try {
    const text = await readAnalyseBody(request);
    const fields = readFields(text, request.headers.get("content-type") ?? "");
    if (!fields) return compatError(400, "The request body isn't valid JSON.");

    const insights = analyseText({ content: fields.content, hidePrivate: undefined });
    return json(describeCompatInsights(insights));
  } catch (error) {
    return compatFailure(error);
  }
}

