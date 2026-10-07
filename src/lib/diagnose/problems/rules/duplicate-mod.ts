import type { Rule } from "../types";
import { fileNames, joinNames } from "./text";

const FILES = /Mod ID: '([^']{1,80})' from mod files: (.{1,400})/;
const OLD = /Found a duplicate mod (\S{1,80}) at (.{1,400})/;

export const duplicateMod: Rule = {
  id: "duplicate-mod",
  read(line) {
    const short = line.slice(0, 1000);
    const match = FILES.exec(short) ?? OLD.exec(short);
    if (!match) return null;

    const files = fileNames(match[2]);
    const where = files.length > 0 ? ` (${joinNames(files)})` : "";
    return {
      key: match[1],
      message: `${match[1]} is in the mods folder more than once${where}.`,
      solutions: [
        "Keep one copy in the mods folder and delete the others. Check for a leftover older version after an update.",
        "If two different mods both bundle the same library, keep the newer of the two mods, or ask the authors to fix it.",
      ],
    };
  },
};
