import type { Rule } from "../types";
import { baseName } from "./text";

const FAILED = /Failed loading config file (\S{1,160}) of type \S{1,30} for modid (\S{1,60})/;
const EMPTY = /ParsingException: Not enough data available/;

export const brokenModConfig: Rule = {
  id: "broken-mod-config",
  read(line) {
    const short = line.slice(0, 1000);

    const failed = FAILED.exec(short);
    if (failed) {
      const file = baseName(failed[1]);
      return {
        key: `${failed[2]}/${file}`,
        message: `The settings file ${file} for ${failed[2]} is broken, so the mod couldn't load it.`,
        solutions: [
          `Close the game or server, then delete or rename ${file} in the config folder. The mod writes a fresh one with default settings the next time it starts.`,
          "If you edited it by hand, look for a missing quote, bracket or comma.",
        ],
      };
    }

    if (EMPTY.test(short)) {
      return {
        key: "empty",
        message: "A mod's settings file is empty or cut off, so it couldn't be read.",
        solutions: [
          "Look a few lines above for the file name. Close the game or server, delete that file from the config folder, and start again.",
          "This often happens after a crash or a full disk. Make sure the drive has free space.",
        ],
      };
    }

    return null;
  },
};
