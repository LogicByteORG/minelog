import type { Rule } from "../types";
import { limit } from "./text";

const LIST = /Missing (?:or unsupported )?mandatory dependencies:\s*(\S.{0,300})/;
const DETAIL =
  /Mod ID: '([^']{1,80})', Requested by: '([^']{1,80})', Expected range: '([^']{1,80})', Actual version: '([^']{1,80})'/;

function loaderName(id: string): string | null {
  if (id === "forge") return "Forge";
  if (id === "neoforge") return "NeoForge";
  return null;
}

function range(text: string): string {
  const open = /^\[([^,\]]{1,40}),\)$/.exec(text);
  if (open) return `${open[1]} or newer`;
  const exact = /^\[([^,\]]{1,40})\]$/.exec(text);
  if (exact) return `exactly ${exact[1]}`;
  return text;
}

export const forgeDependency: Rule = {
  id: "forge-dependency",
  read(line) {
    const short = line.slice(0, 1000);

    const detail = DETAIL.exec(short);
    if (detail) {
      const [, id, by, expected, actual] = detail;
      const missing = actual === "[MISSING]";
      const loader = loaderName(id);
      const have = limit(actual, 40);

      if (loader) {
        return {
          key: `${by}>${id}`,
          message: missing
            ? `${by} needs ${loader}, which isn't installed.`
            : `${by} needs ${loader} ${range(expected)}, but you have ${have}.`,
          solutions: [
            `Update ${loader} to ${range(expected)}, or download the version of ${by} that fits the ${loader} you run.`,
            "Mods built for different loader versions can't be mixed. Check the file names for the game version and loader.",
          ],
        };
      }

      return {
        key: `${by}>${id}`,
        message: missing
          ? `${by} needs ${id}, which isn't installed.`
          : `${by} needs ${id} ${range(expected)}, but you have ${have}.`,
        solutions: missing
          ? [
              `Download ${id} (${range(expected)}) for your game version and loader, and put it in the mods folder.`,
              `Or remove ${by} if you don't need it.`,
            ]
          : [
              `Replace ${id} with a version that fits (${range(expected)}). You have ${have}.`,
              `Or update ${by} to a version that works with ${id} ${have}.`,
            ],
      };
    }

    const list = LIST.exec(short);
    if (list) {
      const names = [...new Set(list[1].split(/,\s*/).map((part) => part.trim()).filter(Boolean))].slice(0, 8);
      return {
        key: "list",
        message: `Some mods need other mods that aren't installed: ${names.join(", ")}.`,
        solutions: [
          "Download the missing mods for your game version and loader, and put them in the mods folder.",
          "If the list is mostly forge, your mods were made for a different Forge version than the one you run. Match the Forge version to what the mods ask for.",
        ],
      };
    }

    return null;
  },
};
