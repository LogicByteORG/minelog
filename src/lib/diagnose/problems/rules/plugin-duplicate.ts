import type { Rule } from "../types";
import { baseName } from "./text";

const PATTERN = /Ambiguous plugin name `([^']{1,60})' for files `([^']{1,160})' and `([^']{1,160})'/;

export const pluginDuplicate: Rule = {
  id: "plugin-duplicate",
  read(line) {
    const match = PATTERN.exec(line.slice(0, 1000));
    if (!match) return null;
    const first = baseName(match[2]);
    const second = baseName(match[3]);
    return {
      key: match[1],
      message: `Two files in the plugins folder are both ${match[1]} (${first} and ${second}).`,
      solutions: [
        `Delete the older of the two files from the plugins folder and restart. Keep only one copy of ${match[1]}.`,
        "This often happens after an update when the old jar was never removed.",
      ],
    };
  },
};
