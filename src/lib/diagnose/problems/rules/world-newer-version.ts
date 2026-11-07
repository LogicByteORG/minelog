import type { Rule } from "../types";

const PATTERN = /saved with newer version of minecraft!? (\d+) > (\d+)/i;

export const worldNewerVersion: Rule = {
  id: "world-newer-version",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "newer",
      message: "This world was saved by a newer Minecraft version than the one running now.",
      solutions: [
        "Start the world with the same version it was last played on, or a newer one. Minecraft can't open worlds from the future.",
        "Make a copy of the world folder before you try anything. Opening it in an older version can damage it for good.",
        "If you meant to go back, restore a backup made before the upgrade.",
      ],
    };
  },
};
