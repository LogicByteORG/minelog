import type { DetailChild } from "./parse";
import type { LineNo } from "./types";

export type ModRow = {
  line: LineNo;
  id: string;
  name: string;
  version?: string;
};

function forgeRow(child: DetailChild): ModRow | null {
  const fields = child.text.split("|").map((field) => field.trim());
  if (fields.length < 4 || !/^[a-z][\w.-]*$/i.test(fields[2])) return null;
  return {
    line: child.line,
    id: fields[2],
    name: fields[1],
    version: fields[3] || undefined,
  };
}

function fabricRow(child: DetailChild): ModRow | null {
  const m = /^([^\s:]+): (.+) (\S+)$/.exec(child.text);
  return m ? { line: child.line, id: m[1], name: m[2], version: m[3] } : null;
}

export function modRows(
  key: "Mod List" | "Fabric Mods",
  children: DetailChild[],
): ModRow[] {
  if (children.length === 0) return [];
  const top = Math.min(...children.map((child) => child.indent));
  const parse = key === "Mod List" ? forgeRow : fabricRow;
  return children
    .filter((child) => child.indent === top)
    .map(parse)
    .filter((row): row is ModRow => row !== null);
}

