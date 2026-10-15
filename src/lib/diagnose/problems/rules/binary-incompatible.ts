import type { Rule } from "../types";
import { limit } from "./text";

const PATTERN = /java\.lang\.(IllegalAccessError|AbstractMethodError|IncompatibleClassChangeError): (.{1,200})/;

export const binaryIncompatible: Rule = {
  id: "binary-incompatible",
  read(line) {
    const match = PATTERN.exec(line.slice(0, 1000));
    if (!match) return null;
    if (/module java\.base/.test(match[2])) return null;
    const detail = limit(match[2].trim(), 140);
    return {
      key: match[1],
      message: `Two parts of this setup don't fit together (${match[1]}).`,
      solutions: [
        `The error says: "${detail}". The class names in it point at the mods or plugins involved.`,
        "Check every mod or plugin file against your exact game version and loader. This error almost always means one of them was built for another version.",
        "Update the library mods that others depend on, like Fabric API, Architectury or Cloth Config, and keep the loader up to date.",
        "To find the one, remove mods in halves and test, then narrow it down.",
      ],
    };
  },
};
