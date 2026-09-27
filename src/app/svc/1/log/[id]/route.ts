import type { NextRequest } from "next/server";
import { readInsights } from "@/lib/diagnose/insights";
import { isValidId } from "@/lib/ids";
import { findLog, findLogInfo } from "@/lib/logs";
import { guardInsightRead } from "@/lib/service/analyse";
import { describeCompat } from "@/lib/service/describe";
import { describeCompatContentInsights } from "@/lib/service/describe-insights";
import { deleteLogFor } from "@/lib/service/delete";
import { compatFailure, compatNotFound, json, preflight } from "@/lib/service/respond";

export const OPTIONS = preflight;

function wants(request: NextRequest, name: string): boolean {
  const value = request.nextUrl.searchParams.get(name);
  return value !== null && value !== "0" && value !== "false";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidId(id)) return compatNotFound();

  const raw = wants(request, "raw");
  const parsed = wants(request, "parsed");
  const insights = wants(request, "insights");

  if (!raw && !parsed && !insights) {
    const log = await findLogInfo(id);
    return log ? json(describeCompat(log, request)) : compatNotFound();
  }

  if (parsed || insights) {
    try {
      guardInsightRead(request);
    } catch (error) {
      return compatFailure(error);
    }
  }

  const log = await findLog(id);
  if (!log) return compatNotFound();
  const { content, ...info } = log;

  const read = parsed || insights ? readInsights(content, info.kind) : null;
  const parts: Record<string, unknown> = {};
  if (raw) parts.raw = content;
  if (read && parsed) parts.parsed = read.entries();
  if (read && insights) parts.insights = describeCompatContentInsights(read);

  return json({ ...describeCompat(info, request), content: parts });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await deleteLogFor(id, request);
    return json({ success: true });
  } catch (error) {
    return compatFailure(error);
  }
}

