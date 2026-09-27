import { classifyLines, type LineLevel, type LogKind } from "../log";
import { parseRecords } from "./parse";
import type { LineNo } from "./types";

export type EntryLine = { number: LineNo; content: string };

export type Entry = {
  level: number;
  time: string | null;
  prefix: string | null;
  lines: EntryLine[];
};

export type Span = {
  from: LineNo;
  to: LineNo;
  level: number;
  prefix: string | null;
  chat: boolean;
};

const INFO = 6;

const TAG_LEVEL: Record<string, number> = {
  FATAL: 2,
  ERROR: 3,
  WARN: 4,
  INFO: INFO,
  DEBUG: 7,
  TRACE: 7,
};

const LINE_LEVEL: Record<LineLevel, number> = {
  error: 3,
  warn: 4,
  debug: 7,
  info: INFO,
  stack: INFO,
  plain: INFO,
};

export function spansOf(lines: string[], kind: LogKind): Span[] {
  if (lines.length === 0) return [];

  const records = parseRecords(lines);
  const spans: Span[] = [];

  if (records.length > 0) {
    if (records[0].line > 1) {
      spans.push({ from: 1, to: records[0].line - 1, level: INFO, prefix: null, chat: false });
    }
    for (const record of records) {
      spans.push({
        from: record.line,
        to: record.end,
        level: TAG_LEVEL[record.level] ?? INFO,
        prefix: record.prefix || null,
        chat: record.chat,
      });
    }
    return spans;
  }

  const infos = classifyLines(lines, kind);
  let open: Span | null = null;
  for (let i = 0; i < lines.length; i += 1) {
    if (open === null || infos[i].start) {
      open = {
        from: i + 1,
        to: i + 1,
        level: infos[i].start ? LINE_LEVEL[infos[i].level] : INFO,
        prefix: null,
        chat: false,
      };
      spans.push(open);
    } else {
      open.to = i + 1;
    }
  }
  return spans;
}

export function spanAt(spans: Span[], line: LineNo): Span {
  let low = 0;
  let high = spans.length - 1;
  while (low < high) {
    const middle = (low + high + 1) >> 1;
    if (spans[middle].from <= line) low = middle;
    else high = middle - 1;
  }
  return spans[low];
}

export function entryOf(span: Span, lines: string[], limit = Infinity): Entry {
  const last = Math.min(span.to, span.from + limit - 1);
  const out: EntryLine[] = [];
  for (let number = span.from; number <= last; number += 1) {
    out.push({ number, content: lines[number - 1] });
  }
  return { level: span.level, time: null, prefix: span.prefix, lines: out };
}

