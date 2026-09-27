import { highlightLines, type Language, type Token, type TokenKind } from "./highlight";
import { classifyLines, type LineLevel, type LogKind } from "./log";

export type LevelGroup = "error" | "warn" | "info" | "debug" | "other";

export const LEVEL_GROUPS: LevelGroup[] = [
  "error",
  "warn",
  "info",
  "debug",
  "other",
];

export type ViewLine = {
  n: number;
  text: string;
  level: LineLevel;
  group: LevelGroup;
  start: boolean;
  tokens?: Token[];
};

export function parseLines(
  content: string,
  kind: LogKind,
  language: Language | null = null,
): ViewLine[] {
  const raw = content.split(/\r?\n/);
  if (raw.length > 1 && raw[raw.length - 1] === "") raw.pop();

  if (language) {
    const colored = highlightLines(raw, language);
    return raw.map((text, index) => ({
      n: index + 1,
      text,
      level: "plain",
      group: "other",
      start: false,
      tokens: colored[index],
    }));
  }

  const infos = classifyLines(raw, kind);
  let previous: LevelGroup = "other";
  return raw.map((text, index) => {
    const { level, start } = infos[index];
    const group = groupFor(level, previous);
    previous = group;
    return { n: index + 1, text, level, group, start };
  });
}

function groupFor(level: LineLevel, previous: LevelGroup): LevelGroup {
  switch (level) {
    case "error":
    case "warn":
    case "info":
    case "debug":
      return level;
    default:
      return previous;
  }
}

export function countGroups(lines: ViewLine[]): Record<LevelGroup, number> {
  const counts: Record<LevelGroup, number> = {
    error: 0,
    warn: 0,
    info: 0,
    debug: 0,
    other: 0,
  };
  for (const line of lines) {
    if (line.start || line.group === "other") counts[line.group] += 1;
  }
  return counts;
}

export type Query = {
  test: RegExp | null;
  highlight: RegExp | null;
  invalid: boolean;
};

const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g;

export function compileQuery(
  text: string,
  useRegex: boolean,
  matchCase: boolean,
): Query {
  if (text === "") return { test: null, highlight: null, invalid: false };
  try {
    const source = useRegex ? text : text.replace(REGEX_SPECIALS, "\\$&");
    const flags = matchCase ? "" : "i";
    return {
      test: new RegExp(source, flags),
      highlight: new RegExp(source, `${flags}g`),
      invalid: false,
    };
  } catch {
    return { test: null, highlight: null, invalid: true };
  }
}

export function splitMatches(
  text: string,
  highlight: RegExp | null,
): { text: string; match: boolean }[] {
  if (!highlight) return [{ text, match: false }];

  const pieces: { text: string; match: boolean }[] = [];
  let cursor = 0;
  highlight.lastIndex = 0;

  for (let found = highlight.exec(text); found; found = highlight.exec(text)) {
    if (found[0] === "") {
      highlight.lastIndex += 1;
      continue;
    }
    if (found.index > cursor) {
      pieces.push({ text: text.slice(cursor, found.index), match: false });
    }
    pieces.push({ text: found[0], match: true });
    cursor = found.index + found[0].length;
  }

  if (cursor < text.length) pieces.push({ text: text.slice(cursor), match: false });
  return pieces.length > 0 ? pieces : [{ text, match: false }];
}

export function overlayMatches(
  tokens: Token[],
  highlight: RegExp | null,
): { text: string; kind: TokenKind; match: boolean }[] {
  const text = tokens.map((token) => token.text).join("");
  const pieces = splitMatches(text, highlight);
  const out: { text: string; kind: TokenKind; match: boolean }[] = [];

  let t = 0;
  let used = 0;
  for (const piece of pieces) {
    let left = piece.text.length;
    while (left > 0 && t < tokens.length) {
      const take = Math.min(left, tokens[t].text.length - used);
      out.push({
        text: tokens[t].text.slice(used, used + take),
        kind: tokens[t].kind,
        match: piece.match,
      });
      used += take;
      left -= take;
      if (used === tokens[t].text.length) {
        t += 1;
        used = 0;
      }
    }
  }
  return out;
}

export type Filters = {
  levels: Record<LevelGroup, boolean>;
  onlyMatches: boolean;
};

export const ALL_LEVELS_ON: Record<LevelGroup, boolean> = {
  error: true,
  warn: true,
  info: true,
  debug: true,
  other: true,
};

export function filterLines(
  lines: ViewLine[],
  filters: Filters,
  query: Query,
): ViewLine[] {
  const shown = (line: ViewLine) => filters.levels[line.group];
  const test = query.test;

  if (filters.onlyMatches && test) {
    return lines.filter((line) => shown(line) && test.test(line.text));
  }
  return lines.filter(shown);
}

export function findMatches(lines: ViewLine[], query: Query): number[] {
  const test = query.test;
  if (!test) return [];
  const found: number[] = [];
  for (const line of lines) if (test.test(line.text)) found.push(line.n);
  return found;
}

export function levelTargets(lines: ViewLine[], group: LevelGroup): number[] {
  const found: number[] = [];
  for (const line of lines) {
    if (line.group === group && (line.start || group === "other")) {
      found.push(line.n);
    }
  }
  return found;
}

export type Row =
  | { kind: "line"; line: ViewLine }
  | { kind: "fold"; key: number; lines: ViewLine[] };

const MIN_FOLD = 3;

export function buildRows(lines: ViewLine[], fold: boolean): Row[] {
  if (!fold) return lines.map((line) => ({ kind: "line", line }));

  const rows: Row[] = [];
  let run: ViewLine[] = [];

  const flush = () => {
    if (run.length >= MIN_FOLD) {
      rows.push({ kind: "fold", key: run[0].n, lines: run });
    } else {
      for (const line of run) rows.push({ kind: "line", line });
    }
    run = [];
  };

  for (const line of lines) {
    const continues = run.length > 0 && line.n === run[run.length - 1].n + 1;
    if (line.level === "stack" && (run.length === 0 || continues)) {
      run.push(line);
      continue;
    }
    flush();
    if (line.level === "stack") run.push(line);
    else rows.push({ kind: "line", line });
  }
  flush();
  return rows;
}

export function locateLine(
  rows: Row[],
  n: number,
): { index: number; foldKey: number | null } | null {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (row.kind === "line") {
      if (row.line.n === n) return { index, foldKey: null };
    } else if (row.lines.some((line) => line.n === n)) {
      return { index, foldKey: row.key };
    }
  }
  return null;
}

export const MARKS_PARAM = "marks";

export const MARKS_EVENT = "minelog:marks";

export const MAX_MARKS = 1000;

export function parseMarks(value: string | null): Set<number> {
  const found = new Set<number>();
  if (!value) return found;
  const take = (n: number) => {
    if (Number.isInteger(n) && n >= 1 && n <= 999999999) {
      found.add(n);
      return true;
    }
    return false;
  };
  for (const part of value.split(",")) {
    if (found.size >= MAX_MARKS) break;
    const dash = part.indexOf("-");
    if (dash === -1) {
      take(Number(part));
      continue;
    }
    let low = Number(part.slice(0, dash));
    let high = Number(part.slice(dash + 1));
    if (!Number.isInteger(low) || !Number.isInteger(high)) continue;
    if (low < 1 || high < 1) continue;
    if (low > high) [low, high] = [high, low];
    for (let n = low; n <= high && found.size < MAX_MARKS; n += 1) {
      take(n);
    }
  }
  return found;
}

export function formatMarks(marked: Set<number>): string | null {
  if (marked.size === 0) return null;
  const sorted = [...marked].sort((a, b) => a - b).slice(0, MAX_MARKS);
  const parts: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  const flush = () => {
    parts.push(start === prev ? `${start}` : `${start}-${prev}`);
  };
  for (const n of sorted.slice(1)) {
    if (n === prev + 1) {
      prev = n;
    } else {
      flush();
      start = n;
      prev = n;
    }
  }
  flush();
  return parts.join(",");
}

const TIMESTAMP = /^\[(?:\d{1,2}[A-Za-z]{3}\d{4} )?\d{2}:\d{2}:\d{2}(?:[.,]\d+)?\]:?\s?/;

export function stripTimestamp(text: string): string {
  return text.replace(TIMESTAMP, "");
}

