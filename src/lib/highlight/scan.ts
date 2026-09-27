import { scanCsv, scanDiff, scanIni, scanMarkup } from "./formats";
import { SPECS } from "./specs";
import { START_STATE, type Language, type ScanState, type Token, type TokenKind } from "./types";
import { closeAt, push } from "./util";

const MAX_SCANNED_LENGTH = 2_000;

const NUMBER =
  /0[xX][\da-fA-F_]+[uUlLn]*|0[bB][01_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d+)?[fFuUlLn]*/y;
const WORD = /[A-Za-z_$][\w$]*/y;
const CSS_WORD = /--?[A-Za-z_][\w-]*|[A-Za-z_][\w-]*/y;
const HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/y;
const ANNOTATION = /@[A-Za-z_][\w.]*/y;

function startsComment(line: string, i: number, marker: string): boolean {
  if (!line.startsWith(marker, i)) return false;
  return marker !== "#" || i === 0 || /\s/.test(line[i - 1]);
}

function isPropertyName(line: string, at: number, word: string): boolean {
  if (line.slice(0, at).trim() !== "") return false;
  const rest = line.slice(at + word.length);
  return /^\s*:(?!:)/.test(rest) && rest.includes(";");
}

export function scanLine(
  line: string,
  language: Language,
  state: ScanState,
): { tokens: Token[]; state: ScanState } {
  if (line.length > MAX_SCANNED_LENGTH) {
    return { tokens: [{ text: line, kind: "plain" }], state };
  }

  switch (language) {
    case "html":
    case "xml":
      return scanMarkup(line, state);
    case "ini":
      return { tokens: scanIni(line), state };
    case "diff":
      return { tokens: scanDiff(line), state };
    case "csv":
      return scanCsv(line, state);
  }

  const spec = SPECS[language];
  const tokens: Token[] = [];
  let open = state.open;
  let i = 0;

  scan: while (i < line.length) {
    if (open) {
      const end = closeAt(line, i, open.end, open.escape);
      if (end === -1) {
        push(tokens, line.slice(i), open.kind);
        i = line.length;
      } else {
        push(tokens, line.slice(i, end), open.kind);
        i = end;
        open = null;
      }
      continue;
    }

    for (const block of spec.blocks) {
      if (line.startsWith(block.start, i)) {
        push(tokens, block.start, block.kind);
        i += block.start.length;
        open = block;
        continue scan;
      }
    }

    for (const marker of spec.line) {
      if (startsComment(line, i, marker)) {
        push(tokens, line.slice(i), "comment");
        break scan;
      }
    }

    const ch = line[i];

    if (spec.preprocessor && ch === "#" && line.slice(0, i).trim() === "") {
      const comment = line.indexOf("//", i);
      const end = comment === -1 ? line.length : comment;
      push(tokens, line.slice(i, end), "preproc");
      i = end;
      continue;
    }

    if (spec.annotations && ch === "@") {
      ANNOTATION.lastIndex = i;
      const found = ANNOTATION.exec(line);
      if (found) {
        push(tokens, found[0], "preproc");
        i += found[0].length;
        continue;
      }
    }

    if (spec.hexColors && ch === "#") {
      HEX_COLOR.lastIndex = i;
      const found = HEX_COLOR.exec(line);
      if (found) {
        push(tokens, found[0], "number");
        i += found[0].length;
        continue;
      }
    }

    if (spec.quotes.includes(ch)) {
      const end = closeAt(line, i + 1, ch, true);
      const stop = end === -1 ? line.length : end;
      push(tokens, line.slice(i, stop), "string");
      i = stop;
      continue;
    }

    if (/[\d.]/.test(ch) && (ch !== "." || /\d/.test(line[i + 1] ?? ""))) {
      NUMBER.lastIndex = i;
      const found = NUMBER.exec(line);
      if (found) {
        push(tokens, found[0], "number");
        i += found[0].length;
        continue;
      }
    }

    if (
      /[A-Za-z_$]/.test(ch) ||
      (spec.hyphenWords && ch === "-" && /[A-Za-z-]/.test(line[i + 1] ?? ""))
    ) {
      const pattern = spec.hyphenWords ? CSS_WORD : WORD;
      pattern.lastIndex = i;
      const word = (pattern.exec(line) as RegExpExecArray)[0];
      const key = spec.ignoreCase ? word.toLowerCase() : word;
      let kind: TokenKind = "plain";
      if (spec.keys && isPropertyName(line, i, word)) kind = "type";
      else if (spec.keywords.has(key)) kind = "keyword";
      else if (spec.literals.has(key)) kind = "literal";
      else if (spec.types.has(key)) kind = "type";
      else if (spec.calls && line.slice(i + word.length).trimStart().startsWith("(")) {
        kind = "func";
      } else if (spec.capitalTypes && /^[A-Z][a-z\d]/.test(word)) kind = "type";
      push(tokens, word, kind);
      i += word.length;
      continue;
    }

    push(tokens, ch, "plain");
    i += 1;
  }

  return { tokens, state: { open } };
}

export function highlightLines(lines: string[], language: Language): Token[][] {
  let state = START_STATE;
  return lines.map((line) => {
    const scanned = scanLine(line, language, state);
    state = scanned.state;
    return scanned.tokens;
  });
}

