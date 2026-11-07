import type { Rule } from "../types";

const PATTERN = /java\.util\.ConcurrentModificationException/;

export const concurrentModification: Rule = {
  id: "concurrent-modification",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "concurrent",
      message: "Two threads changed the same list at once, and Java stopped one of them.",
      solutions: [
        "Check the frames under this line. The first one with a plugin or mod package is the one doing the unsafe work.",
        "Update that plugin or mod. This is almost always a bug in its code, not in your setup.",
        "It often happens when a plugin touches the world from an async task. If it only shows up now and then, report it to the author with the full trace.",
      ],
    };
  },
};
