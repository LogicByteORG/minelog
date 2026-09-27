import type { NextRequest } from "next/server";
import { readInsights } from "@/lib/diagnose/insights";
import { isValidId } from "@/lib/ids";
import { findLog } from "@/lib/logs";
import { guardInsightRead } from "@/lib/service/analyse";
import { describeCompatInsights } from "@/lib/service/describe-insights";
import {
  BRIEF_CACHE,
  compatFailure,
  compatNotFound,
  json,
  preflight,
} from "@/lib/service/respond";

export const OPTIONS = preflight;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    guardInsightRead(request);
    const { id } = await params;
    if (!isValidId(id)) return compatNotFound();

    const log = await findLog(id);
    if (!log) return compatNotFound();

    return json(describeCompatInsights(readInsights(log.content, log.kind)), 200, BRIEF_CACHE);
  } catch (error) {
    return compatFailure(error);
  }
}

