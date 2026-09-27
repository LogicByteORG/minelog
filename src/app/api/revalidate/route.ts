import { revalidateTag } from "next/cache";
import { isValidId } from "@/lib/ids";
import { logTag } from "@/lib/log-cache";
import { bearerMatches } from "@/lib/secret";

const NO_STORE = { "Cache-Control": "no-store" };
const MAX_IDS = 256;

export async function POST(request: Request) {
  if (!bearerMatches(request, process.env.REVALIDATE_SECRET)) {
    return new Response(null, { status: 404, headers: NO_STORE });
  }

  let ids: unknown;
  try {
    ({ ids } = await request.json());
  } catch {
    return new Response(null, { status: 400, headers: NO_STORE });
  }
  if (
    !Array.isArray(ids) ||
    ids.length > MAX_IDS ||
    !ids.every((id) => typeof id === "string" && isValidId(id))
  ) {
    return new Response(null, { status: 400, headers: NO_STORE });
  }

  for (const id of ids) revalidateTag(logTag(id), { expire: 0 });
  return new Response(null, { status: 204, headers: NO_STORE });
}
