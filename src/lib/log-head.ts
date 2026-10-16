import { INLINE_LOG_CHARS, VIEW_CHUNK_LINES } from "./config";

export type LogHead = { head: string; complete: boolean };

export function takeHead(
  content: string,
  maxChars = INLINE_LOG_CHARS,
  maxLines = VIEW_CHUNK_LINES,
): LogHead {
  if (content.length <= maxChars) return { head: content, complete: true };

  let cut = -1;
  let seen = 0;
  let at = content.indexOf("\n");
  while (at !== -1 && at <= maxChars && seen < maxLines) {
    cut = at;
    seen += 1;
    at = content.indexOf("\n", at + 1);
  }

  if (cut === -1) {
    const code = content.charCodeAt(maxChars - 1);
    const split = code >= 0xd800 && code <= 0xdbff ? maxChars - 1 : maxChars;
    return { head: content.slice(0, split), complete: false };
  }

  const end = content[cut - 1] === "\r" ? cut - 1 : cut;
  return { head: content.slice(0, end), complete: false };
}
