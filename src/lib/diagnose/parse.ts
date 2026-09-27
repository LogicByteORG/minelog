import type { LineNo, LogRecord } from "./types";

const TIME = String.raw`\[(?:\d{2}[A-Za-z]{3}\d{4} )?\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?\]`;

const HEADER = new RegExp(
  `^${TIME} \\[([^\\]]+?)/(TRACE|DEBUG|INFO|WARN|ERROR|FATAL)\\](.*)$`,
);
const HEADER_REST = /^(?: \[([^\]]*)\]| \(([^)]*)\))?:? ?(.*)$/;

const HEADER_BUKKIT =
  /^\[\d{2}:\d{2}:\d{2} (TRACE|DEBUG|INFO|WARN|WARNING|ERROR|FATAL)\]: (.*)$/;

const CHAT =
  /^(?:\[Not Secure\] )?<[^<>\s]{1,40}> |^\[(?:Server|Rcon)\] |^\[@\]|^\S{1,40} issued server command: /;
const CHAT_THREAD = /^Async Chat Thread/;

export const MAX_READ_LINE = 4000;

export function clipLine(line: string): string {
  return line.length > MAX_READ_LINE ? line.slice(0, MAX_READ_LINE) : line;
}

export function parseRecords(lines: string[]): LogRecord[] {
  const records: LogRecord[] = [];
  let current: LogRecord | null = null;

  for (let i = 0; i < lines.length; i += 1) {
    const text = clipLine(lines[i]);
    let next: LogRecord | null = null;

    const head = HEADER.exec(text);
    if (head) {
      const rest = HEADER_REST.exec(head[3]);
      const message = rest ? rest[3] : head[3];
      next = {
        line: i + 1,
        end: i + 1,
        thread: head[1],
        level: head[2],
        logger: rest ? (rest[1] ?? rest[2] ?? "").replace(/\/[^/]*$/, "") : "",
        message,
        prefix: text.slice(0, text.length - message.length).trimEnd(),
        chat: CHAT_THREAD.test(head[1]) || CHAT.test(message),
      };
    } else {
      const bukkit = HEADER_BUKKIT.exec(text);
      if (bukkit) {
        next = {
          line: i + 1,
          end: i + 1,
          thread: "",
          level: bukkit[1] === "WARNING" ? "WARN" : bukkit[1],
          logger: "",
          message: bukkit[2],
          prefix: text.slice(0, text.length - bukkit[2].length).trimEnd(),
          chat: CHAT.test(bukkit[2]),
        };
      }
    }

    if (next) {
      records.push(next);
      current = next;
    } else if (current) {
      current.end = i + 1;
    }
  }
  return records;
}

export type DetailChild = {
  line: LineNo;
  text: string;
  indent: number;
};

export type DetailEntry = {
  key: string;
  value: string;
  line: LineNo;
  children: DetailChild[];
};

function indentOf(text: string): number {
  let width = 0;
  for (const ch of text) {
    if (ch === "\t") width += 4;
    else if (ch === " ") width += 1;
    else break;
  }
  return width;
}

export function systemDetails(lines: string[]): DetailEntry[] {
  const start = lines.findIndex((l) => l.trim() === "-- System Details --");
  if (start === -1) return [];

  const entries: DetailEntry[] = [];
  let base = -1;
  for (let i = start + 1; i < lines.length; i += 1) {
    const text = clipLine(lines[i]);
    if (text.trim() === "") continue;
    if (text.trim() === "Details:") continue;
    if (!/^\s/.test(text)) break;

    const indent = indentOf(text);
    if (base === -1) base = indent;
    const body = text.trim();

    const entry = indent === base ? /^([^:]+):[ ]?(.*)$/.exec(body) : null;
    if (entry) {
      entries.push({
        key: entry[1].trim(),
        value: entry[2].trim(),
        line: i + 1,
        children: [],
      });
    } else if (indent > base && entries.length > 0) {
      entries[entries.length - 1].children.push({ line: i + 1, text: body, indent });
    }
  }
  return entries;
}

