import { modRows } from "./modrows";
import type { DetailEntry } from "./parse";
import type { LogRecord, ModEntry } from "./types";

const MAX_MODS = 5000;

const FABRIC_HEAD = /^Loading \d+ mods?:?$/;

function fabricList(
  record: LogRecord,
  lines: string[],
): { mods: ModEntry[]; bundled: number } {
  const mods: ModEntry[] = [];
  const bundled = new Set<string>();
  for (let n = record.line + 1; n <= record.end; n += 1) {
    const text = lines[n - 1];
    const m = /^\s*- (\S+) (\S+)$/.exec(text);
    if (m) {
      mods.push({ kind: "mod", name: m[1], id: m[1], version: m[2], line: n });
      continue;
    }
    const inner = /^\s*(?:\|--|\\--) (\S+ \S+)$/.exec(text);
    if (inner) bundled.add(inner[1]);
  }
  return { mods, bundled: bundled.size };
}

const BUKKIT_HEAD = /^\[PluginInitializerManager\] Bukkit plugins \(\d+\):$/;

function bukkitList(record: LogRecord, lines: string[]): ModEntry[] {
  const out: ModEntry[] = [];
  for (let n = record.line + 1; n <= record.end; n += 1) {
    const text = lines[n - 1];
    if (!text.startsWith("- ")) continue;
    for (const m of text.slice(2).matchAll(/([^\s,()]{1,100}) \(([^)]{0,100})\)/g)) {
      out.push({ kind: "plugin", name: m[1], version: m[2], line: n });
    }
  }
  return out;
}

const PLUGIN_LINE = /^\[([^\]\s]+)\] (?:Enabling|Loading server plugin) (\S+) v(\S+)/;

export function readMods(
  records: LogRecord[],
  lines: string[],
  details: DetailEntry[],
): { mods: ModEntry[]; bundled: number } {
  const found: ModEntry[] = [];
  let bundled = 0;

  for (const record of records) {
    if (record.chat) continue;
    const { message } = record;

    if (FABRIC_HEAD.test(message) && (record.logger === "" || record.logger === "FabricLoader")) {
      const list = fabricList(record, lines);
      found.push(...list.mods);
      bundled += list.bundled;
      continue;
    }
    if (BUKKIT_HEAD.test(message)) {
      found.push(...bukkitList(record, lines));
      continue;
    }
    const plugin = PLUGIN_LINE.exec(message);
    if (plugin && plugin[1] === plugin[2]) {
      found.push({ kind: "plugin", name: plugin[2], version: plugin[3], line: record.line });
      continue;
    }
  }

  for (const entry of details) {
    if (entry.key !== "Fabric Mods" && entry.key !== "Mod List") continue;
    for (const row of modRows(entry.key, entry.children)) {
      found.push({
        kind: "mod",
        id: row.id,
        name: entry.key === "Fabric Mods" ? row.name : row.name || row.id,
        version: row.version,
        line: row.line,
      });
    }
  }

  const seen = new Set<string>();
  const unique: ModEntry[] = [];
  for (const mod of found) {
    const key = `${mod.kind}:${(mod.id ?? mod.name).toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(mod);
    if (unique.length >= MAX_MODS) break;
  }
  return { mods: unique, bundled };
}

