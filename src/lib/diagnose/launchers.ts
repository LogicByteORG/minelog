export type LauncherRule = {
  name: string;
  path: RegExp;
};

const sep = String.raw`[\\/]`;

export const LAUNCHERS: LauncherRule[] = [
  { name: "LabyMod", path: new RegExp(`${sep}(?:LabyMod|labymod-neo)${sep}`, "i") },
  { name: "Modrinth App", path: new RegExp(`${sep}(?:ModrinthApp|com\\.modrinth\\.theseus)${sep}`, "i") },
  { name: "Prism Launcher", path: new RegExp(`${sep}PrismLauncher${sep}`, "i") },
  { name: "MultiMC", path: new RegExp(`${sep}MultiMC${sep}`, "i") },
  { name: "CurseForge", path: new RegExp(`${sep}curseforge${sep}minecraft${sep}`, "i") },
  { name: "ATLauncher", path: new RegExp(`${sep}ATLauncher${sep}`, "i") },
  { name: "Lunar Client", path: new RegExp(`${sep}\\.lunarclient${sep}`, "i") },
  { name: "Badlion Client", path: new RegExp(`${sep}Badlion Client${sep}`, "i") },
];

export function launchersIn(text: string): string[] {
  if (!/[\\/]/.test(text)) return [];
  return LAUNCHERS.filter((rule) => rule.path.test(text)).map((rule) => rule.name);
}

