import { NextResponse, type NextRequest } from "next/server";
import { DeleteError, deleteLogFor } from "@/lib/service/delete";

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

