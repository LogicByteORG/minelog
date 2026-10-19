export type SupportedFileType = {
  kind: string;
  example: string;
  note: string;
};

export const SUPPORTED_FILE_TYPES: SupportedFileType[] = [
  {
    kind: "Client log",
    example: ".minecraft/logs/latest.log",
    note: "What the game prints while you play.",
  },
  {
    kind: "Server log",
    example: "logs/latest.log",
    note: "Vanilla, Paper, Spigot, Fabric, Forge and NeoForge all work.",
  },
  {
    kind: "Crash report",
    example: "crash-reports/crash-…-client.txt",
    note: "The report Minecraft writes when it goes down with an error.",
  },
  {
    kind: "Java crash report",
    example: "hs_err_pid12345.log",
    note: "What Java itself leaves behind when the whole JVM falls over.",
  },
  {
    kind: "YAML config",
    example: "config.yml, bukkit.yml",
    note: "Most plugin and server configs in Bukkit style.",
  },
  {
    kind: "TOML config",
    example: "server.toml",
    note: "The format a lot of Forge and Fabric mods use.",
  },
  {
    kind: "Properties file",
    example: "server.properties",
    note: "Plain key=value files, nothing fancy.",
  },
  {
    kind: "JSON file",
    example: "fabric.mod.json, pack.mcmeta",
    note: "Mod manifests, resource packs, any valid JSON.",
  },
  {
    kind: "README",
    example: "README.md",
    note: "Rendered as Markdown instead of plain text.",
  },
];

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
