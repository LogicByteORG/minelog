import type { Rule } from "../types";

const PATTERN = /Incompatible mod set|Incompatible FML modded server|mismatched mod channel list/i;

export const modSetMismatch: Rule = {
  id: "mod-set-mismatch",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "mods",
      message: "The game and the server don't have the same mods, so the connection was refused.",
      solutions: [
        "Put the same mods on the client and on the server, in the same versions. A different version of the same mod counts as a mismatch.",
        "Compare the mods folder on both sides file by file. The server's modpack or mod list is the one to copy.",
        "Mods that only add things you see, like minimaps or shaders, can usually stay on one side. The mod's page says which sides it needs.",
        "Make sure both sides run the same loader and loader version, like Fabric or Forge.",
      ],
    };
  },
};
