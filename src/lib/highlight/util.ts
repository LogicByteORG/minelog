import type { Token, TokenKind } from "./types";

export function push(tokens: Token[], text: string, kind: TokenKind) {
  if (text === "") return;
  const last = tokens[tokens.length - 1];
  if (last && last.kind === kind) last.text += text;
  else tokens.push({ text, kind });
}

export function closeAt(line: string, from: number, end: string, escape: boolean): number {
  for (let i = from; i < line.length; i += 1) {
    if (escape && line[i] === "\\") i += 1;
    else if (line.startsWith(end, i)) return i + end.length;
  }
  return -1;
}

