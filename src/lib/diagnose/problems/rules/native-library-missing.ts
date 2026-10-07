import type { Rule } from "../types";

const PATTERN = /UnsatisfiedLinkError: Failed to locate library: (\S{1,60})/;

export const nativeLibraryMissing: Rule = {
  id: "native-library-missing",
  read(line) {
    const match = PATTERN.exec(line.slice(0, 1000));
    if (!match) return null;
    return {
      key: match[1],
      message: `Java couldn't load ${match[1]}, a helper file the game needs for graphics or sound.`,
      solutions: [
        "Close the game, delete the natives folder of this game version, and start again. Your launcher unpacks a fresh copy.",
        "Check your antivirus. It may have quarantined the file. Allow the Minecraft folder and let the launcher repair the game files.",
        "Make sure Java and the operating system are both 64-bit, and that the launcher installed the game version for your system.",
      ],
    };
  },
};
