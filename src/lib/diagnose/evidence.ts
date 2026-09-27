import { launchersIn } from "./launchers";
import { modRows } from "./modrows";
import type { Evidence } from "./resolve";
import type { DetailEntry } from "./parse";
import type { EnvironmentKey, LogRecord, ModEntry } from "./types";

export type Claim = Evidence & { about: EnvironmentKey };

const VERSION_ID =
  /^(?:\d{1,2}\.\d{1,2}(?:\.\d{1,2})?(?:-(?:pre|rc)\d+)?|\d{2}w\d{2}[a-z])$/;

export function isGameVersion(text: string): boolean {
  return VERSION_ID.test(text);
}

const JAVA_VERSION = /^\d+(?:\.\d+)*(?:_\d+)?$/;

export function javaMajor(version: string): string | null {
  if (!JAVA_VERSION.test(version)) return null;
  const legacy = /^1\.(\d+)/.exec(version);
  return legacy ? legacy[1] : /^(\d+)/.exec(version)![1];
}

type Made = Omit<Claim, "line">;

function game(version: string, source: string, weight: number): Made[] {
  return isGameVersion(version)
    ? [{ about: "gameVersion", key: version, source, weight }]
    : [];
}

function java(raw: string, source: string, weight: number, vendor?: string): Made[] {
  const version = raw.trim();
  const major = javaMajor(version);
  if (!major) return [];
  return [
    {
      about: "java",
      key: major,
      label: version === major ? major : version,
      detail: vendor?.trim() || undefined,
      source,
      weight,
    },
  ];
}

function loader(
  id: string,
  source: string,
  weight: number,
  version?: string,
): Made[] {
  return [{ about: "loader", key: id, source, weight, detail: version }];
}

type MessageRule = [RegExp, (m: RegExpExecArray) => Made[]];

function buildOf(version: string): string | undefined {
  const m = /^(?:git-\w+-|\d[\d.]*-)(\d+)/.exec(version);
  return m ? `build ${m[1]}` : undefined;
}

const SERVER_FLAVOURS: Record<string, string> = {
  paper: "paper",
  purpur: "purpur",
  folia: "folia",
  pufferfish: "pufferfish",
  leaf: "leaf",
  spigot: "spigot",
  craftbukkit: "spigot",
};

const MESSAGE_RULES: MessageRule[] = [
  [
    /^Loading Minecraft (\S+) with (Fabric|Quilt) Loader (\S+)$/,
    (m) => [
      ...game(m[1], "loader-line", 3),
      ...loader(m[2].toLowerCase(), "loader-line", 3, m[3]),
    ],
  ],
  [
    /^Starting (?:integrated )?minecraft server version (\S+)$/,
    (m) => game(m[1], "server-start", 3),
  ],
  [/\bService=Knot\/Fabric\b/, () => loader("fabric", "mixin-service", 2)],
  [
    /^This server is running (\w+) version (\S+)/,
    (m) => {
      const id = SERVER_FLAVOURS[m[1].toLowerCase()];
      return id ? loader(id, "server-banner", 3, buildOf(m[2])) : [];
    },
  ],
  [/^This server is running .*\(MC: (\S+?)\)/, (m) => game(m[1], "server-banner", 3)],
  [
    /^This server is running .*\(Implementing API version (\d[^\s-]*)-R\d/,
    (m) => game(m[1], "api-version", 2),
  ],
  [
    /^\[bootstrap\] Loading (\w+) (\S+) .* for Minecraft (\S+)$/,
    (m) => {
      const id = SERVER_FLAVOURS[m[1].toLowerCase()];
      return [
        ...game(m[3], "server-bootstrap", 3),
        ...(id ? loader(id, "server-bootstrap", 3, buildOf(m[2])) : []),
      ];
    },
  ],
  [
    /^\[bootstrap\] Running Java (\d+(?:\.\d+)*) \(.{0,200}?; (.{0,200}?)(?: null)?\)/,
    (m) => java(m[1], "server-bootstrap", 3, m[2]),
  ],
  [
    /^Forge Mod Loader version (\S+) for Minecraft (\S+?)[,\s]/,
    (m) => [
      ...loader("forge", "fml-banner", 3, m[1]),
      ...game(m[2], "fml-banner", 3),
    ],
  ],
  [
    /^(Forge|NeoForge) mod loading, version (\S+?), for MC (\S+)$/,
    (m) => [
      ...loader(m[1].toLowerCase(), "mod-loading", 3, m[2]),
      ...game(m[3], "mod-loading", 3),
    ],
  ],
  [
    /^ModLauncher \S+ starting: java version (\S+) by (.+?);/,
    (m) => java(m[1], "modlauncher", 3, m[2]),
  ],
  [/--fml\.mcVersion, (\S+?)[,\]]/, (m) => game(m[1], "fml-args", 3)],
  [/--fml\.forgeVersion, (\S+?)[,\]]/, (m) => loader("forge", "fml-args", 3, m[1])],
  [
    /--fml\.neoForgeVersion, (\S+?)[,\]]/,
    (m) => loader("neoforge", "fml-args", 3, m[1]),
  ],
  [/^# Minecraft Version: (\S+)$/, (m) => game(m[1], "system-block", 3)],
  [/^Minecraft Version: (\S+)$/, (m) => game(m[1], "version-line", 2)],
  [
    /^# Java: (\S+)(?: \(([^)]*)\))?/,
    (m) => java(m[1], "system-block", 3, m[2]),
  ],
  [/^Compatibility level set to JAVA_(\d+)$/, (m) => java(m[1], "mixin-level", 1)],
  [/\bFabricLoaderImpl\b/, () => loader("fabric", "loader-class", 2)],
];

const LOGGER_RULES: [RegExp, string][] = [
  [/^(?:net\.fabricmc\.|FabricLoader$)/, "fabric"],
  [/^(?:org\.quiltmc\.|Quilt ?Loader$)/, "quilt"],
  [/^(?:net\.minecraftforge\.|ne\.mi\.)/, "forge"],
  [/^(?:net\.neoforged\.|ne\.ne\.)/, "neoforge"],
];

const FRAME_RULES: [RegExp, string][] = [
  [/^(?:\s+at |Caused by: )?net\.fabricmc\.loader\./, "fabric"],
  [/^(?:\s+at |Caused by: )?org\.quiltmc\.loader\./, "quilt"],
  [/^(?:\s+at |Caused by: )?net\.minecraftforge\.fml\./, "forge"],
  [/^(?:\s+at |Caused by: )?net\.neoforged\.fml\./, "neoforge"],
];

export function claimsFromRecord(
  record: LogRecord,
  lines: string[],
): Claim[] {
  if (record.chat) return [];
  const out: Claim[] = [];
  const at = record.line;

  for (const [re, make] of MESSAGE_RULES) {
    const m = re.exec(record.message);
    if (m) for (const c of make(m)) out.push({ ...c, line: at });
  }
  for (const name of launchersIn(record.message)) {
    out.push({ about: "launcher", key: name, source: "path", weight: 3, line: at });
  }
  for (const [re, id] of LOGGER_RULES) {
    if (record.logger && re.test(record.logger)) {
      out.push({ about: "loader", key: id, source: "logger", weight: 2, line: at });
    }
  }

  const last = Math.min(record.end, record.line + 60);
  const frameSeen = new Set<string>();
  for (let n = record.line; n <= last; n += 1) {
    const text = lines[n - 1];
    for (const [re, id] of FRAME_RULES) {
      if (frameSeen.has(id) || !re.test(text)) continue;
      frameSeen.add(id);
      out.push({ about: "loader", key: id, source: "stack", weight: 1, line: n });
    }
  }
  return out;
}

const LAUNCHED = [
  { re: /^fabric-loader-(\S+?)-(\d\S*)$/, id: "fabric", version: 1, game: 2 },
  { re: /^quilt-loader-(\S+?)-(\d\S*)$/, id: "quilt", version: 1, game: 2 },
  { re: /^(\d\S*?)-forge-(\S+)$/, id: "forge", version: 2, game: 1 },
] as const;

export function claimsFromDetails(entries: DetailEntry[]): Claim[] {
  const out: Claim[] = [];
  for (const { key, value, line, children } of entries) {
    const add = (made: Made[]) => made.forEach((c) => out.push({ ...c, line }));

    if (key === "Minecraft Version" || key === "Minecraft Version ID") {
      add(game(value, "crash-details", 3));
    } else if (key === "Java Version") {
      const [version, vendor] = value.split(/,\s*/, 2);
      add(java(version, "crash-details", 3, vendor));
    } else if (key === "Fabric Mods") {
      add(loader("fabric", "crash-details", 3));
    } else if (key === "Forge") {
      const m = /^(?:net\.minecraftforge:)?(\d\S*)$/.exec(value);
      if (m) add(loader("forge", "crash-details", 3, m[1]));
    } else if (key === "NeoForge") {
      const m = /^(?:net\.neoforged:)?(\d\S*)$/.exec(value);
      if (m) add(loader("neoforge", "crash-details", 3, m[1]));
    } else if (key === "Mod List" || key === "Fabric Mods") {
      for (const row of modRows(key, children)) {
        if (row.id === "minecraft") {
          add(game(row.version ?? "", "crash-modlist", 2));
        } else if (row.id === "fabricloader" && key === "Fabric Mods") {
          add(loader("fabric", "crash-modlist", 2, row.version));
        } else if (row.id === "forge" && key === "Mod List") {
          add(loader("forge", "crash-modlist", 2, row.version));
        } else if (row.id === "neoforge" && key === "Mod List") {
          add(loader("neoforge", "crash-modlist", 2, row.version));
        }
      }
    } else if (key === "Launched Version") {
      for (const rule of LAUNCHED) {
        const m = rule.re.exec(value);
        if (!m) continue;
        add(loader(rule.id, "crash-launched", 2, m[rule.version]));
        add(game(m[rule.game], "crash-launched", 2));
      }
    }
  }
  return out;
}

export function claimsFromModList(mods: ModEntry[]): Claim[] {
  const out: Claim[] = [];
  for (const mod of mods) {
    if (mod.kind !== "mod" || !mod.version) continue;
    const add = (made: Made[]) => made.forEach((c) => out.push({ ...c, line: mod.line }));
    if (mod.id === "minecraft") add(game(mod.version, "mod-list", 2));
    else if (mod.id === "fabricloader") add(loader("fabric", "mod-list", 2, mod.version));
    else if (mod.id === "java") add(java(mod.version, "mod-list", 3));
  }
  return out;
}

export function claimsFromJvmCrash(lines: string[]): Claim[] {
  const out: Claim[] = [];
  const head = lines.slice(0, 80);
  head.forEach((text, i) => {
    const jre = /^# JRE version: .*\((\d+(?:\.\d+)*(?:_\d+)?)[+)]/.exec(text);
    if (jre) {
      for (const c of java(jre[1], "jvm-crash", 4)) out.push({ ...c, line: i + 1 });
    }
    const vm = /^# Java VM: .*\((\d+(?:\.\d+)*(?:_\d+)?)[+,]/.exec(text);
    if (vm) {
      for (const c of java(vm[1], "jvm-vm", 2)) out.push({ ...c, line: i + 1 });
    }
  });
  return out;
}

