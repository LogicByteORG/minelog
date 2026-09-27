import { isValidId } from "@/lib/ids";
import { findLogText } from "@/lib/logs";
import { compatNotFound, plainText, preflight } from "@/lib/service/respond";

export const OPTIONS = preflight;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidId(id)) return compatNotFound();
  const text = await findLogText(id);
  return text === null ? compatNotFound() : plainText(text);
}

