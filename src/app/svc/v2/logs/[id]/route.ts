import type { NextRequest } from "next/server";
import { isValidId } from "@/lib/ids";
import { findLog, findLogInfo } from "@/lib/logs";
import { describeV2 } from "@/lib/service/describe";
import { deleteLogFor } from "@/lib/service/delete";
import { json, preflight, v2Failure, v2NotFound } from "@/lib/service/respond";

export const OPTIONS = preflight;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidId(id)) return v2NotFound();

  if (request.nextUrl.searchParams.get("content") === "true") {
    const log = await findLog(id);
    if (!log) return v2NotFound();
    const { content, ...info } = log;
    return json({ ...describeV2(info, request), content });
  }

  const log = await findLogInfo(id);
  return log ? json(describeV2(log, request)) : v2NotFound();
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await deleteLogFor(id, request);
    return json({ id, deleted: true });
  } catch (error) {
    return v2Failure(error);
  }
}

