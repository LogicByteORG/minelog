import { requiredJava } from "../../java-versions";
import type { Rule } from "../types";

const MAJOR = /Unsupported class file major version (\d{2,3})/;
const MODULES =
  /Unable to make protected final java\.lang\.Class java\.lang\.ClassLoader\.defineClass|because module java\.base does not export/;

export const javaTooNew: Rule = {
  id: "java-too-new",
  read(line, { environment }) {
    const short = line.slice(0, 1000);

    const major = MAJOR.exec(short);
    if (major) {
      const java = Number(major[1]) - 44;
      const game = environment.gameVersion?.value;
      const needs = game ? requiredJava(game) : null;
      const fit = game && needs !== null ? ` Minecraft ${game} is made for Java ${needs}.` : "";
      return {
        key: `major/${java}`,
        message: `Something in this setup is too old to read code built for Java ${java}.`,
        solutions: [
          `Run the game with the Java version your game version is made for.${fit}`,
          "Update the mod loader and the mods. The old part is usually a mod or loader that bundles an outdated library.",
          "A mod built for a newer game version can also cause this. Check each mod file for your game version.",
        ],
      };
    }

    if (MODULES.test(short)) {
      return {
        key: "modules",
        message: "This older game or loader can't run on the newer Java you picked.",
        solutions: [
          "Minecraft 1.16 and older, and their Forge versions, are made for Java 8. Pick Java 8 in your launcher's instance settings.",
          "If you need a newer Java for something else, install both and choose Java 8 only for this instance.",
        ],
      };
    }

    return null;
  },
};
