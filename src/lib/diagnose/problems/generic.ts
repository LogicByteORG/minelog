import type { LogKind } from "../../log";
import type { Span } from "../entries";
import type { LineNo } from "../types";
import type { Problem } from "./types";

export const GENERIC_PROBLEM_IDS = ["unknown-error", "crash-summary"];

const MAX_GENERIC = 10;
const MESSAGE_CHARS = 200;
const SUMMARY_CHARS = 140;

const ERROR_LEVEL = 3;

const LOG_PREFIX = /^(?:\[[^\]\n]{1,64}\] ?){1,3}(?::\s*)?/;
const BOILERPLATE = /preparing crash report|crash report saved to|negative index in crash report/i;
const DESCRIPTION = /^\s{0,3}Description:\s*(.{1,140})/;
const JVM_HEAD =
  /^#\s+(A fatal error has been detected|There is insufficient memory|An unexpected error has been detected|Internal Error|Problematic frame)(.{0,120})/;
const EXCEPTION_HEAD =
  /^(?:Exception in thread "[^"\n]{1,80}"\s+)?([\w$][\w$.]{0,120}(?:Exception|Error))/;

function clean(line: string): string {
  return line.replace(LOG_PREFIX, "").trim();
}

function shorten(text: string, limit: number): string {
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

export function genericProblems(lines: string[], spans: Span[], matched: Set<Span>): Problem[] {
  const groups = new Map<string, Problem>();

  for (const span of spans) {
    if (span.chat || span.level > ERROR_LEVEL || matched.has(span)) continue;
    const first = lines[span.from - 1];
    if (first === undefined) continue;
    const message = clean(first.slice(0, 4000));
    if (message.length === 0 || BOILERPLATE.test(message)) continue;

    const known = groups.get(message);
    if (known) {
      known.count += 1;
    } else {
      groups.set(message, {
        id: "unknown-error",
        message: shorten(message, MESSAGE_CHARS),
        solutions: [
          "Search this exact line together with your game version. The first results usually name the mod or setting behind it.",
          "If the line names a mod or plugin file, check that it matches your game version and loader, or remove it and test again.",
        ],
        count: 1,
        line: span.from,
      });
    }
  }

  return [...groups.values()]
    .sort((a, b) => a.line - b.line)
    .slice(0, MAX_GENERIC);
}

function descriptionOf(lines: string[]): { text: string; line: LineNo } | null {
  for (let i = 0; i < lines.length; i += 1) {
    const match = DESCRIPTION.exec(lines[i].slice(0, 400));
    if (match && match[1].trim().length > 0) {
      return { text: match[1].trim(), line: (i + 1) as LineNo };
    }
  }
  return null;
}

function exceptionOf(lines: string[]): { text: string; line: LineNo } | null {
  for (let i = 0; i < lines.length; i += 1) {
    const match = EXCEPTION_HEAD.exec(lines[i].slice(0, 400));
    if (match) {
      return { text: match[1], line: (i + 1) as LineNo };
    }
  }
  return null;
}

function jvmHeadOf(lines: string[]): { text: string; line: LineNo } | null {
  for (let i = 0; i < lines.length; i += 1) {
    const match = JVM_HEAD.exec(lines[i].slice(0, 400));
    if (match) {
      return { text: `${match[1]}${match[2].trim()}`, line: (i + 1) as LineNo };
    }
  }
  return null;
}

function crashSolutions(line: LineNo): string[] {
  return [
    `The full story is in the lines around line ${line}. Look for "Caused by" lower down, it names the real trigger.`,
    "If those lines name a mod or plugin file, make sure it matches your game version and loader, or remove it and test again.",
  ];
}

export function crashSummary(lines: string[], kind: LogKind): Problem | null {
  if (kind === "crash") {
    const description = descriptionOf(lines);
    if (description) {
      return {
        id: "crash-summary",
        message: `The report says: "${shorten(description.text, SUMMARY_CHARS)}"`,
        solutions: crashSolutions(description.line),
        count: 1,
        line: description.line,
      };
    }
    const exception = exceptionOf(lines);
    if (!exception) return null;
    return {
      id: "crash-summary",
      message: `The crash is a ${exception.text}.`,
      solutions: crashSolutions(exception.line),
      count: 1,
      line: exception.line,
    };
  }

  if (kind === "jvm") {
    const found = jvmHeadOf(lines);
    if (!found) return null;
    return {
      id: "crash-summary",
      message: `Java stopped: "${shorten(found.text, SUMMARY_CHARS)}"`,
      solutions: [
        `The details are in the lines around line ${found.line}. The "Problematic frame" line names where it stopped.`,
        "If it stopped inside a mod or driver file, update that mod and your Java, or remove the mod and test again.",
      ],
      count: 1,
      line: found.line,
    };
  }

  return null;
}
