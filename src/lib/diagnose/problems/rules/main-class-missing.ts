import type { Rule } from "../types";

const PATTERN = /Error: Could not find or load main class (\S{1,120})/;

export const mainClassMissing: Rule = {
  id: "main-class-missing",
  read(line) {
    const match = PATTERN.exec(line.slice(0, 1000));
    if (!match) return null;
    return {
      key: match[1],
      message: `Java can't find ${match[1]}, so the game or server never started.`,
      solutions: [
        "In a start script, check the java command. A typo in the -jar part, a missing space or a wrong file name is the usual cause.",
        "Make sure the jar is in the folder you start from, and that its download finished. A tiny or empty jar fails this way.",
        "If the class is net.minecraft.client.main.Main or similar, the launcher's game files are damaged. Reinstall that version from the launcher.",
      ],
    };
  },
};
