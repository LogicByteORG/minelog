import type { Rule } from "../types";

const PATTERN =
  /java\.lang\.(NoClassDefFoundError|NoSuchMethodError|NoSuchFieldError): ([\w$]+(?:[./][\w$]+){1,20})/;

export const missingClass: Rule = {
  id: "missing-class",
  read(line) {
    const match = PATTERN.exec(line.slice(0, 1000));
    if (!match) return null;
    const name = match[2].replaceAll("/", ".");
    const group = name.split(".").slice(0, 3).join(".");
    return {
      key: group,
      message: `Something is looking for ${name}, and this version of the game or its libraries doesn't have it.`,
      solutions: [
        "This usually means a mod, or a library mod it depends on, was made for a different game version or loader. Check each file name for the version and loader.",
        "Update the library mods, like Fabric API, Architectury, Cloth Config or GeckoLib, to the newest version for your game.",
        "If it began after you added a mod, remove that one first.",
      ],
    };
  },
};
