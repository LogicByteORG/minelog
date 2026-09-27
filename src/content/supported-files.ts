export type SupportedFileType = {
  kind: string;
  example: string;
  note: string;
};

// Mirrors the detection in src/lib/log.ts (detectKind / KIND_LABEL). Keep
// this in sync if a new kind gets added there.
export const SUPPORTED_FILE_TYPES: SupportedFileType[] = [
  {
    kind: "Client log",
    example: ".minecraft/logs/latest.log",
    note: "What the game prints while you play.",
  },
  {
    kind: "Server log",
    example: "logs/latest.log",
    note: "Vanilla, Paper, Spigot, Fabric or Forge — they all look the same to us.",
  },
  {
    kind: "Crash report",
    example: "crash-reports/crash-…-client.txt",
    note: "Minecraft's own report when it dies with an error.",
  },
  {
    kind: "Java crash report",
    example: "hs_err_pid12345.log",
    note: "Written by Java itself when the JVM crashes outright.",
  },
  {
    kind: "YAML config",
    example: "config.yml, bukkit.yml",
    note: "Most plugin and server configs, Bukkit-style.",
  },
  {
    kind: "TOML config",
    example: "server.toml",
    note: "Common in Forge and Fabric mod configs.",
  },
  {
    kind: "Properties file",
    example: "server.properties",
    note: "Plain key=value config files.",
  },
  {
    kind: "JSON file",
    example: "fabric.mod.json, pack.mcmeta",
    note: "Mod manifests, resource packs, any valid JSON.",
  },
  {
    kind: "README",
    example: "README.md",
    note: "Rendered as Markdown, not just plain text.",
  },
];

// Fallback syntax highlighting for anything that isn't one of the kinds
// above. Mirrors src/lib/highlight/types.ts (Language / LANGUAGE_LABEL).
export const HIGHLIGHTED_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Java",
  "Kotlin",
  "C",
  "C++",
  "C#",
  "Python",
  "Lua",
  "Go",
  "Rust",
  "PHP",
  "Shell script",
  "SQL",
  "HTML",
  "XML",
  "CSS",
  "INI config",
  "Diff",
  "CSV",
];
