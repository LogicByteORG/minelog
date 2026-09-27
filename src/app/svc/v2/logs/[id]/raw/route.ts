import { isValidId } from "@/lib/ids";
import { findLogText } from "@/lib/logs";
import { plainText, preflight, v2NotFound } from "@/lib/service/respond";

export const OPTIONS = preflight;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidId(id)) return v2NotFound();
  const text = await findLogText(id);
  return text === null ? v2NotFound() : plainText(text);
}

