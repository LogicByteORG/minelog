import type { Rule } from "../types";
import { baseName } from "./text";

const MISSING = /(\S{1,200}\.jar)[^\n]{0,40}?missing (?:a |the )?(?:neoforge\.)?mods\.toml/i;
const INVALID = /(\S{1,200}\.jar)[^\n]{0,40}?not a valid mod file/i;
const LIBRARY = /[\\/]libraries[\\/]/;

export const notAForgeMod: Rule = {
  id: "not-a-forge-mod",
  read(line) {
    const short = line.slice(0, 1000);
    const match = MISSING.exec(short) ?? INVALID.exec(short);
    if (!match) return null;
    if (LIBRARY.test(match[1])) return null;
    const name = baseName(match[1]).slice(0, 80);
    const fabric = /fabric|quilt/i.test(name);
    return {
      key: name,
      message: fabric
        ? `${name} is a Fabric or Quilt mod, so Forge and NeoForge skip it.`
        : `${name} doesn't look like a Forge or NeoForge mod, so the loader skips it.`,
      solutions: [
        "Remove the file from the mods folder, or download the build made for your loader and game version from the mod's page.",
        "A mod file with fabric in its name belongs on Fabric, and one with forge or neoforge in it belongs on Forge or NeoForge. Mixed folders don't load.",
        "If the file is a library or a plugin and not a mod, it doesn't belong in the mods folder at all. A download that stopped halfway can also look like this, so download it again.",
      ],
    };
  },
};
