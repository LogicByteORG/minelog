import type { Rule } from "../types";

const PATTERN = /Failed to load registries due to above errors/;

export const registriesFailed: Rule = {
  id: "registries-failed",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "registries",
      message: "A data pack or mod broke the game's registries, so the world couldn't load.",
      solutions: [
        "Scroll up to the lines just before this one. They name the file and the exact entry that failed.",
        "Remove or update the data pack or mod that owns that file. A pack made for another Minecraft version is the usual cause.",
        "If it's a world data pack, move it out of the world's datapacks folder and start again.",
      ],
    };
  },
};
