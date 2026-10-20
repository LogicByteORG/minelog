import { logDownloadName } from "@/lib/download";
import { isValidId } from "@/lib/ids";
import { findPrivateLogText } from "@/lib/logs";
import { getSession } from "@/lib/session";
import { streamedText } from "./respond";

export async function privateLogResponse(id: string, download: boolean): Promise<Response | null> {
  if (!isValidId(id)) return null;
  const session = await getSession();
  if (!session) return null;
  const text = await findPrivateLogText(id, session.user.id);
  if (text === null) return null;
  return streamedText(text, { owner: true, saveAs: download ? logDownloadName(id) : undefined });
}

export function privateNotFound(): Response {
  return new Response("This log doesn't exist or has expired.", {
    status: 404,
    headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
  });
}
