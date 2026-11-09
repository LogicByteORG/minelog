import type { Rule } from "../types";

const DETAILED = /java\.lang\.NullPointerException: (?:Cannot (?:invoke|read|load|store|assign|throw|enter|exit)[^\n]{0,200}? because (.{1,160}?) is null|Cannot [^\n]{1,200})/;
const PLAIN = /java\.lang\.NullPointerException(?:\s*$|: null\s*$)/;

export const nullPointer: Rule = {
  id: "null-pointer",
  read(line) {
    const text = line.slice(0, 1000);
    const detailed = DETAILED.exec(text);
    if (detailed) {
      const what = detailed[1]?.replace(/^"|"$/g, "");
      return {
        key: what ?? "detail",
        message: what
          ? `Code used something that was never set: ${what} was null.`
          : "Code used something that was never set (NullPointerException).",
        solutions: [
          "Look at the first frame under this line that belongs to a mod or plugin, not to net.minecraft or java. That's the one that broke.",
          "Update that mod or plugin, and the mods it depends on. A null like this often means a newer or older companion mod than it expects.",
          "If it started after an update or a config edit, undo that change first. A missing or half-written config file is a common source.",
          "If the frames are all Minecraft's own, a world, data pack or item with broken data is the likely cause.",
        ],
      };
    }
    if (PLAIN.test(text)) {
      return {
        key: "plain",
        message: "Code used something that was never set (NullPointerException with no details).",
        solutions: [
          "Look at the first frame under this line that belongs to a mod or plugin. That's the one that broke.",
          "Update that mod or plugin to a build made for your exact game version.",
          "If it started after a change, undo that change and test again.",
        ],
      };
    }
    return null;
  },
};
