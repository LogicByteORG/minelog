import type { NextRequest } from "next/server";
import { readInsights } from "@/lib/diagnose/insights";
import { isValidId } from "@/lib/ids";
import { findLog } from "@/lib/logs";
import { guardInsightRead } from "@/lib/service/analyse";
import { describeV2Insights } from "@/lib/service/describe-insights";
import { BRIEF_CACHE, json, preflight, v2Failure, v2NotFound } from "@/lib/service/respond";

export const OPTIONS = preflight;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    guardInsightRead(request);
    const { id } = await params;
    if (!isValidId(id)) return v2NotFound();

    const log = await findLog(id);
    if (!log) return v2NotFound();

    return json(describeV2Insights(readInsights(log.content, log.kind)), 200, BRIEF_CACHE);
  } catch (error) {
    return v2Failure(error);
  }
}

