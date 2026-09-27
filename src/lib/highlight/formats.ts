import { delimiterOf } from "./detect";
import type { ScanState, Token, TokenKind } from "./types";
import { closeAt, push } from "./util";

export function scanMarkup(
  line: string,
  state: ScanState,
): { tokens: Token[]; state: ScanState } {
  const tokens: Token[] = [];
  let open = state.open;
  let inTag = state.inTag ?? false;
  let i = 0;

  while (i < line.length) {
    if (open) {
      const end = closeAt(line, i, open.end, open.escape);
      const stop = end === -1 ? line.length : end;
      push(tokens, line.slice(i, stop), open.kind);
      i = stop;
      if (end !== -1) open = null;
      continue;
    }

    const ch = line[i];

    if (inTag) {
      if (ch === ">" || line.startsWith("/>", i) || line.startsWith("?>", i)) {
        const length = ch === ">" ? 1 : 2;
        push(tokens, line.slice(i, i + length), "plain");
        i += length;
        inTag = false;
      } else if (ch === '"' || ch === "'") {
        open = { start: ch, end: ch, kind: "string", escape: false };
        push(tokens, ch, "string");
        i += 1;
      } else if (/[^\s=/>"'?]/.test(ch)) {
        const word = /[^\s=/>"'?]+/y;
        word.lastIndex = i;
        const text = (word.exec(line) as RegExpExecArray)[0];
        const value = /=\s*$/.test(line.slice(0, i));
        push(tokens, text, value ? "string" : "type");
        i += text.length;
      } else {
        push(tokens, ch, "plain");
        i += 1;
      }
      continue;
    }

    if (ch === "<") {
      if (line.startsWith("<!--", i)) {
        open = { start: "<!--", end: "-->", kind: "comment", escape: false };
        push(tokens, "<!--", "comment");
        i += 4;
        continue;
      }
      if (line.startsWith("<![CDATA[", i)) {
        open = { start: "<![CDATA[", end: "]]>", kind: "string", escape: false };
        push(tokens, "<![CDATA[", "string");
        i += 9;
        continue;
      }
      if (line[i + 1] === "!" || line[i + 1] === "?") {
        const end = line.indexOf(">", i);
        const stop = end === -1 ? line.length : end + 1;
        push(tokens, line.slice(i, stop), "preproc");
        i = stop;
        continue;
      }
      const tag = /<\/?([A-Za-z_][\w.:-]*)/y;
      tag.lastIndex = i;
      const found = tag.exec(line);
      if (found) {
        const opener = found[0].slice(0, found[0].length - found[1].length);
        push(tokens, opener, "plain");
        push(tokens, found[1], "keyword");
        i += found[0].length;
        inTag = true;
        continue;
      }
    }

    if (ch === "&") {
      const entity = /&(?:#\d+|#[xX][\da-fA-F]+|[A-Za-z]\w*);/y;
      entity.lastIndex = i;
      const found = entity.exec(line);
      if (found) {
        push(tokens, found[0], "literal");
        i += found[0].length;
        continue;
      }
    }

    push(tokens, ch, "plain");
    i += 1;
  }

  return { tokens, state: { open, inTag } };
}

const INI_LITERALS = /^(?:true|false|yes|no|on|off|null|none)$/i;

export function scanIni(line: string): Token[] {
  const tokens: Token[] = [];
  const trimmed = line.trimStart();
  if (trimmed.startsWith(";") || trimmed.startsWith("#")) {
    return [{ text: line, kind: "comment" }];
  }
  const section = /^(\s*)(\[[^\]]*\])(.*)$/.exec(line);
  if (section) {
    push(tokens, section[1], "plain");
    push(tokens, section[2], "keyword");
    push(tokens, section[3], "plain");
    return tokens;
  }
  const pair = /^(\s*)([^=\s][^=]*?)(\s*=\s*)(.*)$/.exec(line);
  if (!pair) return [{ text: line, kind: "plain" }];
  const value = pair[4];
  let kind: TokenKind = "plain";
  if (/^(?:"[^"]*"|'[^']*')/.test(value)) kind = "string";
  else if (/^-?\d[\d_.,]*\s*$/.test(value)) kind = "number";
  else if (INI_LITERALS.test(value.trim())) kind = "literal";
  push(tokens, pair[1], "plain");
  push(tokens, pair[2], "type");
  push(tokens, pair[3], "plain");
  push(tokens, value, kind);
  return tokens;
}

export function scanDiff(line: string): Token[] {
  if (/^(?:diff |index |\+\+\+ |--- |new file mode|deleted file mode|similarity index|rename )/.test(line)) {
    return [{ text: line, kind: "keyword" }];
  }
  const hunk = /^(@@ [^@]*@@)(.*)$/.exec(line);
  if (hunk) {
    const tokens: Token[] = [{ text: hunk[1], kind: "func" }];
    push(tokens, hunk[2], "plain");
    return tokens;
  }
  if (line.startsWith("+")) return [{ text: line, kind: "added" }];
  if (line.startsWith("-")) return [{ text: line, kind: "removed" }];
  return [{ text: line, kind: "plain" }];
}

export function scanCsv(
  line: string,
  state: ScanState,
): { tokens: Token[]; state: ScanState } {
  const row = state.row ?? 0;
  const delimiter = state.delimiter ?? delimiterOf(line) ?? ",";
  const tokens: Token[] = [];
  let cell = "";
  let quoted = false;

  const flush = () => {
    const text = cell.trim();
    let kind: TokenKind = "plain";
    if (row === 0) kind = "type";
    else if (text.startsWith('"')) kind = "string";
    else if (/^-?\d+(?:[.,]\d+)?$/.test(text)) kind = "number";
    else if (/^(?:true|false|null)$/i.test(text)) kind = "literal";
    push(tokens, cell, kind);
    cell = "";
  };

  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    if (!quoted && ch === delimiter) {
      flush();
      push(tokens, ch, "plain");
    } else {
      cell += ch;
    }
  }
  flush();
  return { tokens, state: { open: null, row: row + 1, delimiter } };
}

