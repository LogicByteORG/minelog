import { MAX_LOG_LINES } from "./config";
import { detectLanguage, LANGUAGE_LABEL } from "./highlight";
import { checkModeration, type ModerationCategory } from "./moderation";
import { looksLikeEnvFile, privateContentMessage } from "./private-files";
import { redact, type RedactionFinding } from "./redact";

export type LogKind =
  | "server"
  | "client"
  | "crash"
  | "jvm"
  | "yaml"
  | "toml"
  | "props"
  | "json"
  | "readme"
  | "unknown";

export type LineLevel =
  | "info"
  | "warn"
  | "error"
  | "stack"
  | "debug"
  | "plain";

export const KIND_LABEL: Record<LogKind, string> = {
  server: "Server log",
  client: "Client log",
  crash: "Crash report",
  jvm: "Java crash report",
  yaml: "YAML config",
  toml: "TOML config",
  props: "Properties file",
  json: "JSON file",
  readme: "README",
  unknown: "Custom",
};

const MCMETA_SECTION = /^\s*\{\s*"(?:animation|texture|villager|language|gui)"\s*:/;

function looksMcmeta(content: string): boolean {
  const head = content.slice(0, 4_000);
  return /"pack_format"\s*:\s*\d/.test(head) || MCMETA_SECTION.test(head);
}

export function kindLabel(kind: LogKind, content: string): string {
  if (kind === "json" && looksMcmeta(content)) return "MCMETA file";
  if (kind !== "unknown") return KIND_LABEL[kind];
  const language = detectLanguage(content);
  return language ? LANGUAGE_LABEL[language] : KIND_LABEL.unknown;
}

const LEVEL_TAG = /[/\s](INFO|WARN|WARNING|ERROR|FATAL|DEBUG|TRACE)\]/;

const STACK_LINE = /^(\s+at\s|\s*\.\.\. \d+ more)/;

const CAUSED_BY = /^\s*Caused by:/;

const EXCEPTION_HEADER =
  /^(?:Exception in thread "[^"]*"\s+)?(?:[A-Za-z_$][\w$]*\.)*(?:[A-Za-z_$][\w$]*)?(?:Exception|Error|Throwable)(?::|\s|$)/;

const CRASH_DESCRIPTION = /^Description:/;

const JVM_FATAL =
  /^#\s+(?:A fatal error|Problematic frame|SIGSEGV|SIGBUS|EXCEPTION_ACCESS_VIOLATION|Internal Error|There is insufficient memory|Out of Memory Error)/;

const MAX_CLASSIFIED_LINE = 4000;

export type LineInfo = {
  level: LineLevel;
  start: boolean;
  tagged: boolean;
};

function levelFromTag(tag: string): LineLevel {
  switch (tag) {
    case "WARN":
    case "WARNING":
      return "warn";
    case "ERROR":
    case "FATAL":
      return "error";
    case "DEBUG":
    case "TRACE":
      return "debug";
    default:
      return "info";
  }
}

export function classifyLine(rawLine: string, kind: LogKind = "unknown"): LineInfo {
  const line = rawLine.length > MAX_CLASSIFIED_LINE ? rawLine.slice(0, MAX_CLASSIFIED_LINE) : rawLine;
  const tag = LEVEL_TAG.exec(line.slice(0, 96));
  if (tag) return { level: levelFromTag(tag[1]), start: true, tagged: true };

  if (STACK_LINE.test(line)) return { level: "stack", start: false, tagged: false };
  if (CAUSED_BY.test(line)) return { level: "error", start: false, tagged: false };
  if (EXCEPTION_HEADER.test(line)) {
    return { level: "error", start: true, tagged: false };
  }

  if (kind === "crash" && CRASH_DESCRIPTION.test(line)) {
    return { level: "error", start: true, tagged: false };
  }
  if (kind === "jvm" && JVM_FATAL.test(line)) {
    return { level: "error", start: true, tagged: false };
  }

  return { level: "plain", start: false, tagged: false };
}

export function levelOf(line: string, kind: LogKind = "unknown"): LineLevel {
  return classifyLine(line, kind).level;
}

export function classifyLines(lines: string[], kind: LogKind): LineInfo[] {
  let inError = false;
  return lines.map((line) => {
    const info = classifyLine(line, kind);
    let { start } = info;

    if (start && !info.tagged && info.level === "error" && inError) start = false;

    if (info.level === "error") inError = true;
    else if (
      info.level === "warn" ||
      info.level === "info" ||
      info.level === "debug"
    ) {
      inError = false;
    }
    return { ...info, start };
  });
}

function extensionOf(filename: string): string {
  const base = filename.toLowerCase().split(/[\\/]/).pop() ?? "";
  const withoutGz = base.endsWith(".gz") ? base.slice(0, -3) : base;
  const dot = withoutGz.lastIndexOf(".");
  return dot >= 0 ? withoutGz.slice(dot + 1) : "";
}

const TOML_SECTION = /^\s*\[[A-Za-z0-9_.-]+\]\s*$/;
const KEY_EQUALS = /^\s*[A-Za-z0-9_.-]+\s*=\s*.+\s*$/;
const KEY_COLON = /^\s*[A-Za-z0-9_.-]+\s*:\s*\S.*$/;
const PROPS_LINE = /^\s*[^#\s!][^=]*=\s*.+$/;
const INI_SECTION = /^\s*\[[^\]\n]+\]\s*$/;

const TOML_BARE_VALUE = /^\s*(true|false|-?\d[\d_.:+-]*)\s*(#.*)?$/;

function tomlValueOf(line: string): string {
  return line.slice(line.indexOf("=") + 1).trim();
}

function isTomlValue(value: string): boolean {
  const first = value.charAt(0);
  if (first === '"' || first === "'" || first === "[" || first === "{") {
    return true;
  }
  return TOML_BARE_VALUE.test(value);
}

const README_EXTENSIONS = new Set(["md", "markdown", "mdown", "mkd"]);

function isReadmeName(filename: string): boolean {
  const base = filename.toLowerCase().split(/[\\/]/).pop() ?? "";
  if (base === "readme" || base.startsWith("readme.")) return true;
  return README_EXTENSIONS.has(extensionOf(filename));
}

function looksReadme(head: string): boolean {
  const types = new Set<string>();
  if (/^#{1,6}[ \t]+\S/m.test(head)) types.add("heading");
  if ((head.match(/```/g) ?? []).length >= 2) types.add("fence");
  if (/^[ \t]*(?:[-*+][ \t]+\S|\d+\.[ \t]+\S)/m.test(head)) types.add("list");
  if (/^[ \t]*\|.*\|[ \t]*$/m.test(head) && /^[ \t]*\|?[ \t:|-]+\|/m.test(head)) {
    types.add("table");
  }
  if (/!?\[[^\]\n]{1,300}\]\([^)\n]{0,1000}\)/.test(head)) types.add("link");
  if (/^>\s+\S/m.test(head)) types.add("quote");
  if (/<details[\s>]/i.test(head)) types.add("details");
  if (/^[ \t]*[-*+][ \t]+\[[ xX]\][ \t]+\S/m.test(head)) types.add("task");
  if (types.size < 2) return false;
  return (
    types.has("heading") ||
    types.has("fence") ||
    types.has("table") ||
    types.has("details")
  );
}

export function detectKind(text: string, filename?: string): LogKind {
  const head = text.slice(0, 200_000);

  if (head.includes("---- Minecraft Crash Report ----")) return "crash";
  if (/^# A fatal error has been detected by the Java Runtime/m.test(head)) {
    return "jvm";
  }
  if (
    /^\[[^\]]*\] \[(?:Render thread|Client thread)\/|^\[[^\]]*\] \[[^\]]*\]: (?:Setting user:|Backend library: LWJGL version)/m.test(
      head,
    )
  ) {
    return "client";
  }
  if (/\[Server thread\/|Starting minecraft server|Done \(\d+(\.\d+)?s\)!/.test(head)) {
    return "server";
  }
  if (/\[Render thread\/|\[Client thread\/|Setting user:|LWJGL version/.test(head)) {
    return "client";
  }

  const trimmed = head.trim();
  let parsesAsJson = false;
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(text);
      parsesAsJson = true;
    } catch {
    }
  }
  if (parsesAsJson) return "json";

  if (filename && isReadmeName(filename)) return "readme";

  const lines = head.split(/\r?\n/, 200);
  let sections = 0;
  let equals = 0;
  let colons = 0;
  let colonSemis = 0;
  let iniSections = 0;
  let props = 0;
  let notToml = 0;
  let meaningful = 0;
  for (const line of lines) {
    const clean = line.trim();
    if (clean.length === 0 || clean.startsWith("#") || clean.startsWith("!")) {
      continue;
    }
    meaningful += 1;
    if (TOML_SECTION.test(line)) sections += 1;
    if (KEY_EQUALS.test(line)) {
      equals += 1;
      if (!isTomlValue(tomlValueOf(line))) notToml += 1;
    }
    if (INI_SECTION.test(line)) iniSections += 1;
    if (KEY_COLON.test(line)) {
      colons += 1;
      if (clean.endsWith(";")) colonSemis += 1;
    }
    if (PROPS_LINE.test(line)) props += 1;
  }
  const looksToml = sections >= 1 && equals >= 3 && notToml === 0;
  const looksProps =
    props >= 5 && props / Math.max(meaningful, 1) >= 0.6 && colons <= props;
  const looksCssLike = colonSemis >= 2 && colonSemis / Math.max(colons, 1) >= 0.5;
  const looksYaml =
    !looksCssLike &&
    ((colons >= 5 && colons / Math.max(meaningful, 1) >= 0.5) ||
      (/^---(\s|$)/m.test(head) && colons >= 2));
  const looksIni = !looksToml && iniSections >= 2 && equals >= 3;

  if (filename) {
    const ext = extensionOf(filename);
    if (ext === "json") {
      if (parsesAsJson) return "json";
    } else if (ext === "yaml" || ext === "yml") {
      if (looksYaml) return "yaml";
    } else if (ext === "toml") {
      if (looksToml) return "toml";
    } else if (ext === "properties" || ext === "props") {
      if (looksProps) return "props";
    }
    if (ext === "yaml" || ext === "yml" || ext === "toml" || ext === "properties" || ext === "props") {
    }
  }

  if (looksToml) return "toml";
  if (looksIni && !(filename && /\.(?:properties|props)$/i.test(filename))) {
    return "unknown";
  }
  if (looksProps) return "props";
  if (looksYaml) return "yaml";
  if (looksReadme(head)) return "readme";
  return "unknown";
}

export type Analysis = {
  kind: LogKind;
  lineCount: number;
  bytes: number;
  errorCount: number;
  warnCount: number;
  output: string;
  findings: RedactionFinding[];
  blocked: boolean;
  blockCategory?: ModerationCategory;
  blockMessage?: string;
};

const encoder = new TextEncoder();

export function countLines(text: string): number {
  let count = 1;
  for (let at = text.indexOf("\n"); at !== -1; at = text.indexOf("\n", at + 1)) count += 1;
  return text.endsWith("\n") && count > 1 ? count - 1 : count;
}

export function splitLines(text: string): string[] {
  const lines = text.split(/\r?\n/);
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export function analyze(
  text: string,
  hidePrivate: boolean,
  filename?: string,
): Analysis {
  if (text.length === 0) {
    return {
      kind: "unknown",
      lineCount: 0,
      bytes: 0,
      errorCount: 0,
      warnCount: 0,
      output: "",
      findings: [],
      blocked: false,
    };
  }

  const total = countLines(text);
  if (total > MAX_LOG_LINES) {
    return {
      kind: detectKind(text, filename),
      lineCount: total,
      bytes: encoder.encode(text).length,
      errorCount: 0,
      warnCount: 0,
      output: text,
      findings: [],
      blocked: false,
    };
  }

  const { text: output, findings } = hidePrivate
    ? redact(text)
    : { text, findings: [] };

  const kind = detectKind(text, filename);
  const moderation = checkModeration(output);
  const privateContent = looksLikeEnvFile(text);

  let errorCount = 0;
  let warnCount = 0;
  const lines = splitLines(output);
  for (const info of classifyLines(lines, kind)) {
    if (!info.start) continue;
    if (info.level === "error") errorCount += 1;
    else if (info.level === "warn") warnCount += 1;
  }

  return {
    kind,
    lineCount: lines.length,
    bytes: encoder.encode(output).length,
    errorCount,
    warnCount,
    output,
    findings,
    blocked: moderation.blocked || privateContent,
    blockCategory: moderation.category,
    blockMessage: moderation.blocked ? moderation.message : privateContent ? privateContentMessage() : undefined,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

