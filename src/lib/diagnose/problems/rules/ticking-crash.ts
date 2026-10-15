import type { Rule } from "../types";

const PATTERN = /Description: (Ticking entity|Ticking block entity|Exception ticking world)\s*$/;

export const tickingCrash: Rule = {
  id: "ticking-crash",
  read(line) {
    const match = PATTERN.exec(line.slice(0, 400));
    if (!match) return null;

    if (match[1] === "Ticking entity") {
      return {
        key: "entity",
        message: "The game crashed while updating one entity, so a single mob or item is bringing the world down.",
        solutions: [
          "Find the section called Entity being ticked in the report. Entity Type names the mob or item, and Entity's Exact location gives its X, Y and Z.",
          "If the type belongs to a mod, update that mod or remove it and test again.",
          "If it's from the game itself, copy the world first, then delete that entity from its chunk with NBTExplorer or MCA Selector.",
        ],
      };
    }

    if (match[1] === "Ticking block entity") {
      return {
        key: "block-entity",
        message: "The game crashed while updating one block with stored data, like a chest, hopper, furnace or a mod's machine.",
        solutions: [
          "Find the section called Block entity being ticked in the report. It names the block and its X, Y and Z.",
          "If the block belongs to a mod, update that mod or remove it and test again.",
          "If it's from the game itself, copy the world first, then remove that block with NBTExplorer or MCA Selector.",
        ],
      };
    }

    return {
      key: "world",
      message: "The game crashed while updating the world.",
      solutions: [
        "The Caused by lines and the first frame with a mod's package name in the stack trace point at what failed. Update or remove that mod and test again.",
        "If no mod shows up, the damage may be in the world data itself. Copy the world, then restore it from a backup.",
      ],
    };
  },
};
