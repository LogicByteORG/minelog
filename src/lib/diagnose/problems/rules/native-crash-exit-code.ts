import type { Rule } from "../types";

const PATTERN = /exit(?:ed)?(?: with)?(?: exit)? code:?\s*(-?\d{7,10})\b/i;

const CODES: Record<string, { hex: string; name: string }> = {
  "-1073740791": { hex: "0xC0000409", name: "a stack buffer overrun" },
  "3221226505": { hex: "0xC0000409", name: "a stack buffer overrun" },
  "-1073741819": { hex: "0xC0000005", name: "an access violation" },
  "3221225477": { hex: "0xC0000005", name: "an access violation" },
};

export const nativeCrashExitCode: Rule = {
  id: "native-crash-exit-code",
  read(line) {
    const match = PATTERN.exec(line.slice(0, 600));
    if (!match) return null;
    const code = CODES[match[1]];
    if (!code) return null;
    return {
      key: code.hex,
      message: `Windows ended the game after a crash in native code (${code.hex}, ${code.name}), which is not a Java error.`,
      solutions: [
        "Remove mods, shaders and HD resource packs, then test again. Add them back a few at a time to find the one that does it.",
        "Update the graphics driver. It's the most common suspect, but not the only one, so don't stop there if it doesn't help.",
        "Let the launcher repair or reinstall the game files, and install a fresh Java if the launcher uses your own.",
        "If the log just stops with no Java exception above this line, that fits a native crash.",
      ],
    };
  },
};
