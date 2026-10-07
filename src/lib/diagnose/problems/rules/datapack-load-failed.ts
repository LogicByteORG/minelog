import type { Rule } from "../types";

const PATTERN = /Failed to load datapacks, can't proceed with server load/;

export const datapackLoadFailed: Rule = {
  id: "datapack-load-failed",
  read(line) {
    if (!PATTERN.test(line)) return null;
    return {
      key: "datapacks",
      message: "The server stopped because a data pack in the world couldn't be loaded.",
      solutions: [
        "Look at the lines above this one. They usually name the data pack and what is wrong with it.",
        "Remove the data packs you added last from the datapacks folder inside the world, then start again.",
        "Make sure each data pack was made for your Minecraft version. A pack for a much older or newer version can break the load.",
        "To start once without them, add --safeMode to the start command. The server then runs with vanilla data only.",
      ],
    };
  },
};
