import { NextResponse, type NextRequest } from "next/server";
import { isValidId } from "@/lib/ids";
import { findLogText } from "@/lib/logs";
import { DeleteError, deleteLogFor } from "@/lib/service/delete";
import { streamedText } from "@/lib/service/respond";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const text = isValidId(id) ? await findLogText(id) : null;
  if (text === null) {
    return new Response("This log doesn't exist or has expired.", {
      status: 404,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return streamedText(text);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await deleteLogFor(id, request);
    return NextResponse.json({ deleted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof DeleteError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        {
          status: error.status,
          headers: {
            "Cache-Control": "no-store",
            ...(error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {}),
          },
        },
      );
    }
    throw error;
  }
}

