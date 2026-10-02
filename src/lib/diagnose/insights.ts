import { kindLabel, splitLines, type LogKind } from "../log";
import { recordCoverage } from "./coverage";
import { entryOf, spanAt, spansOf, type Entry, type Span } from "./entries";
import { readEnvironment } from "./index";
import {
  isServerSoftware,
  javaText,
  launcherText,
  loaderName,
  loaderText,
} from "./present";
import { findProblems, type Problem } from "./problems";
import type { Environment, LineNo } from "./types";

const READABLE: LogKind[] = ["server", "client", "crash", "jvm"];

export const ENTRY_LINE_LIMIT = 40;

export type Information = {
  label: string;
  value: string;
  line: LineNo;
};

export type Insights = {
  kind: LogKind;
  software: { id: string; name: string };
  type: { id: string; name: string };
  version: string | null;
  title: string;
  environment: Environment;
  information: Information[];
  problems: Problem[];
  entryAt(line: LineNo, limit?: number): Entry;
  entries(): Entry[];
};

function softwareOf(kind: LogKind, environment: Environment): Insights["software"] {
  if (!READABLE.includes(kind)) return { id: "unknown", name: "Unknown" };
  if (kind === "jvm") return { id: "java", name: "Java" };
  const loader = environment.loader;
  return loader
    ? { id: loader.value, name: loaderName(loader.value) }
    : { id: "vanilla", name: "Vanilla" };
}

function typeOf(kind: LogKind, content: string): Insights["type"] {
  switch (kind) {
    case "server":
      return { id: "server", name: "Server Log" };
    case "client":
      return { id: "client", name: "Client Log" };
    case "crash":
    case "jvm":
      return { id: "crash", name: "Crash Report" };
    default:
      return { id: kind, name: kindLabel(kind, content) };
  }
}

function informationOf(environment: Environment): Information[] {
  const list: Information[] = [];
  const at = (lines: LineNo[] | undefined) => lines?.[0] ?? 1;

  const { gameVersion, loader, java, launcher, mods, bundled } = environment;
  if (gameVersion) {
    list.push({ label: "Minecraft version", value: gameVersion.value, line: at(gameVersion.lines) });
  }
  if (loader) {
    list.push({
      label: isServerSoftware(loader.value) ? "Server software" : "Mod loader",
      value: loaderText(loader),
      line: at(loader.lines),
    });
  }
  if (java) list.push({ label: "Java version", value: javaText(java), line: at(java.lines) });
  if (launcher) list.push({ label: "Launcher", value: launcherText(launcher), line: at(launcher.lines) });

  for (const kind of ["mod", "plugin"] as const) {
    const ofKind = mods.filter((mod) => mod.kind === kind);
    if (ofKind.length > 0) {
      list.push({
        label: kind === "mod" ? "Mods" : "Plugins",
        value: String(ofKind.length),
        line: ofKind[0].line,
      });
    }
  }
  if (bundled > 0 && mods.length > 0) {
    list.push({ label: "Bundled mods", value: String(bundled), line: mods[0].line });
  }
  return list;
}

export function readInsights(text: string, kind: LogKind): Insights {
  const lines = splitLines(text);
  const readable = READABLE.includes(kind);

  let spans: Span[] | null = null;
  const getSpans = () => (spans ??= spansOf(lines, kind));

  const environment: Environment = readable
    ? readEnvironment(text, kind)
    : { conflicts: [], mods: [], bundled: 0 };
  const problems = readable ? findProblems({ lines, spans: getSpans(), environment, kind }) : [];
  if (readable) recordCoverage(problems);

  const software = softwareOf(kind, environment);
  const type = typeOf(kind, text);
  const version =
    kind === "jvm" ? (environment.java?.value ?? null) : (environment.gameVersion?.value ?? null);
  const title = readable
    ? [software.name, version, type.name].filter(Boolean).join(" ")
    : type.name;

  return {
    kind,
    software,
    type,
    version,
    title,
    environment,
    information: informationOf(environment),
    problems,
    entryAt: (line, limit = ENTRY_LINE_LIMIT) => entryOf(spanAt(getSpans(), line), lines, limit),
    entries: () => getSpans().map((span) => entryOf(span, lines)),
  };
}

