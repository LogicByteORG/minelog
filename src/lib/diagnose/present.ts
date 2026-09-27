import type { Environment, Fact, ModEntry } from "./types";

const LOADER_NAMES: Record<string, string> = {
  fabric: "Fabric",
  quilt: "Quilt",
  forge: "Forge",
  neoforge: "NeoForge",
  paper: "Paper",
  spigot: "Spigot",
  purpur: "Purpur",
  folia: "Folia",
  pufferfish: "Pufferfish",
  leaf: "Leaf",
};

const SERVER_SOFTWARE = new Set(["paper", "spigot", "purpur", "folia", "pufferfish", "leaf"]);

export function isServerSoftware(id: string): boolean {
  return SERVER_SOFTWARE.has(id);
}

export function loaderName(id: string): string {
  return LOADER_NAMES[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
}

export function loaderText(fact: Fact): string {
  const name = loaderName(fact.value);
  return fact.detail && /^(?:\d|build )/.test(fact.detail) ? `${name} ${fact.detail}` : name;
}

export function javaText(fact: Fact): string {
  return fact.detail ? `${fact.value} (${fact.detail})` : fact.value;
}

export function launcherText(fact: Fact): string {
  return fact.detail ? `${fact.value} ${fact.detail}` : fact.value;
}

const KIND_WORDS = {
  mod: ["mod", "mods"],
  plugin: ["plugin", "plugins"],
} as const;

export function modsText(mods: ModEntry[], bundled = 0): string {
  const counts = { mod: 0, plugin: 0 };
  for (const mod of mods) counts[mod.kind] += 1;
  const text = (Object.keys(counts) as (keyof typeof counts)[])
    .filter((kind) => counts[kind] > 0)
    .map((kind) => `${counts[kind]} ${KIND_WORDS[kind][counts[kind] === 1 ? 0 : 1]}`)
    .join(", ");
  return text && bundled > 0 ? `${text}, and ${bundled} bundled inside them` : text;
}

export function hasFindings(env: Environment): boolean {
  return (
    !!(env.gameVersion || env.loader || env.java || env.launcher) ||
    env.conflicts.length > 0 ||
    env.mods.length > 0
  );
}

