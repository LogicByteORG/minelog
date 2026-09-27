import { SIGNALS, type Signal } from "./signals";
import type { Language } from "./types";

function score(lines: string[], signals: Signal[]): number {
  let total = 0;
  for (const line of lines) {
    for (const [pattern, weight] of signals) {
      if (pattern.test(line)) total += weight;
    }
  }
  return total;
}

export function detectLanguage(content: string): Language | null {
  const head = content.slice(0, 40_000);
  if (looksDiff(head)) return "diff";
  const lines = head
    .split(/\r?\n/, 300)
    .filter((line) => line.trim() !== "" && line.length < 500);
  if (lines.length < 2) return null;

  const points = {} as Record<Language, number>;
  for (const language of Object.keys(SIGNALS) as Language[]) {
    points[language] = score(lines, SIGNALS[language]);
  }

  const families: { total: number; pick: () => Language }[] = [
    { total: points.js + points.ts, pick: () => (points.ts >= 3 ? "ts" : "js") },
    { total: points.c + points.cpp, pick: () => (points.cpp >= 3 ? "cpp" : "c") },
    {
      total: points.html + points.xml,
      pick: () => {
        if (/<!doctype\s+html|<html[\s>]/i.test(head)) return "html";
        if (/^\s*<\?xml\b/m.test(head)) return "xml";
        return points.html > points.xml ? "html" : "xml";
      },
    },
    ...(["java", "kotlin", "csharp", "python", "lua", "go", "rust", "php", "shell", "sql", "css", "ini"] as const).map(
      (language) => ({ total: points[language], pick: () => language as Language }),
    ),
  ].sort((a, b) => b.total - a.total);

  const [best, runnerUp] = families;
  const clear =
    best.total >= 4 &&
    best.total / lines.length >= 0.25 &&
    best.total - runnerUp.total >= 2;
  if (clear) return best.pick();
  return looksCsv(head) ? "csv" : null;
}

function looksDiff(head: string): boolean {
  const lines = head.split(/\r?\n/, 400);
  let hunk = false;
  let git = false;
  let from = false;
  let to = false;
  let changes = 0;
  for (const line of lines) {
    if (/^@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/.test(line)) hunk = true;
    else if (line.startsWith("diff --git ")) git = true;
    else if (/^--- \S/.test(line)) from = true;
    else if (/^\+\+\+ \S/.test(line)) to = true;
    else if (/^[+-]\S/.test(line) || /^[+-]\s/.test(line)) changes += 1;
  }
  return (hunk || git || (from && to)) && changes >= 2;
}

export function delimiterOf(line: string): string | null {
  let commas = 0;
  let semicolons = 0;
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch === ",") commas += 1;
    else if (!quoted && ch === ";") semicolons += 1;
  }
  if (commas === 0 && semicolons === 0) return null;
  return commas >= semicolons ? "," : ";";
}

export function countFields(line: string, delimiter: string): number {
  let fields = 1;
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch === delimiter) fields += 1;
  }
  return fields;
}

function looksCsv(head: string): boolean {
  const rows = head
    .split(/\r?\n/, 300)
    .filter((line) => line.trim() !== "" && line.length < 2_000);
  if (rows.length < 3) return false;
  if (rows.some((row) => /[{}]/.test(row))) return false;
  const delimiter = delimiterOf(rows[0]);
  if (!delimiter) return false;
  if (delimiter === "," && rows.some((row) => row.trimEnd().endsWith(";"))) {
    return false;
  }
  const columns = countFields(rows[0], delimiter);
  if (columns < 2) return false;
  if (columns === 2 && rows.length < 6) return false;
  return rows.every((row) => countFields(row, delimiter) === columns);
}

