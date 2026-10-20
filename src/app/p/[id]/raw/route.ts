import type { NextRequest } from "next/server";
import { privateLogResponse, privateNotFound } from "@/lib/service/private";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const download = request.nextUrl.searchParams.get("download") === "1";
  return (await privateLogResponse(id, download)) ?? privateNotFound();
}
