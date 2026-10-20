import { createHash } from "node:crypto";

export const SUMMARY_MAX = 200;

const ERRORISH = /\b(?:error|exception|fatal|severe|crash)/i;

const STACK_LINE = /^\s+at\s/;

const PREFIX = /^\s*(?:\[[^\]]*\]\s*)+:?\s*/;

const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

const HEX_RUN = /\b[0-9a-f]{8,}\b/gi;

const IPV4 = /\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b/g;

const NUMBER = /\d+/g;

const STACK_LINES_USED = 3;

function normalize(line: string): string {
  return line
    .toLowerCase()
    .replace(PREFIX, "")
    .replace(UUID, "#")
    .replace(IPV4, "#")
    .replace(HEX_RUN, "#")
    .replace(NUMBER, "#")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, SUMMARY_MAX);
}

export function leadLine(content: string): string {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return lines.find((line) => ERRORISH.test(line) && !STACK_LINE.test(line)) ?? lines[0] ?? "";
}

export function summaryOf(content: string): string {
  return leadLine(content).trim().replace(/\s+/g, " ").slice(0, SUMMARY_MAX);
}

export function alertFingerprint(content: string): string {
  const lines = content.split(/\r?\n/);
  const lead = leadLine(content);
  const at = lines.indexOf(lead);
  const stack = lines
    .slice(at + 1)
    .filter((line) => STACK_LINE.test(line))
    .slice(0, STACK_LINES_USED)
    .map(normalize);

  return createHash("sha256")
    .update([normalize(lead), ...stack].join("\n"))
    .digest("hex")
    .slice(0, 32);
}
