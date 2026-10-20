import { NextResponse, type NextRequest } from "next/server";
import { deletableUntil } from "@/lib/logs";
import { BodyError, readBodyText } from "@/lib/service/body";
import { UploadError, uploadLog } from "@/lib/service/upload";
import { SITE_SOURCE_NAME } from "@/lib/config";
import { getSession } from "@/lib/session";
import { rawUrl, siteUrl } from "@/lib/site";

function fail(status: number, error: string, headers?: HeadersInit) {
  return NextResponse.json({ error }, { status, headers });
}

export async function POST(request: NextRequest) {
  let text: string;
  try {
    text = await readBodyText(request);
  } catch (error) {
    if (error instanceof BodyError) {
      return error.problem === "too_large"
        ? fail(413, "This log is too large.")
        : fail(400, "The request body isn't valid gzip.");
    }
    throw error;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    return fail(400, 'Send JSON like {"content": "..."}.');
  }

  const { content, hidePrivate, private: isPrivate } = (payload ?? {}) as {
    content?: unknown;
    hidePrivate?: unknown;
    private?: unknown;
  };

  const session = await getSession();

  try {
    const saved = await uploadLog({
      content,
      hidePrivate,
      source: SITE_SOURCE_NAME,
      request,
      userId: session?.user.id ?? null,
      isPrivate,
    });
    const base = siteUrl(request.nextUrl.origin);
    const owned = isPrivate === true;
    return NextResponse.json(
      {
        id: saved.id,
        url: owned ? `${base}/p/${saved.id}` : `${base}/${saved.id}`,
        raw: owned ? null : rawUrl(saved.id),
        expiresAt: saved.expiresAt.toISOString(),
        deleteToken: saved.deleteToken,
        deletableUntil: owned ? null : deletableUntil(saved.createdAt).toISOString(),
        private: owned,
      },
      { status: 201, headers: owned ? { "Cache-Control": "no-store" } : undefined },
    );
  } catch (error) {
    if (error instanceof UploadError) {
      return fail(
        error.status,
        error.message,
        error.retryAfter ? { "Retry-After": String(error.retryAfter) } : undefined,
      );
    }
    throw error;
  }
}

