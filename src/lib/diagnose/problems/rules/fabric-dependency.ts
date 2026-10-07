import type { Rule } from "../types";
import { limit } from "./text";

const DEPENDENCY =
  /Mod '([^']{1,80})' \(([^)]{1,60})\) \S{1,40} requires (.{1,100}?) of (?:mod '([^']{1,80})' \(([^)]{1,60})\)|([^\s,]{1,60})), (?:(which is missing)|but only the wrong versions? (?:is|are) present: ([^!]{1,120}))!/;

const BREAKS =
  /Mod '([^']{1,80})' \(([^)]{1,60})\) \S{1,40} is incompatible with .{1,100}? of (?:mod '([^']{1,80})' \(([^)]{1,60})\)|([^\s,]{1,60})), yet/;

const KNOWN: Record<string, string> = {
  fabric: "Fabric API",
  "fabric-api": "Fabric API",
  fabricloader: "Fabric Loader",
  minecraft: "Minecraft",
  java: "Java",
};

export const fabricDependency: Rule = {
  id: "fabric-dependency",
  read(line) {
    const short = line.slice(0, 1000);

    if (short.includes(" requires ")) {
      const match = DEPENDENCY.exec(short);
      if (match) {
        const [, modName, modId, wanted, depTitle, depIdQuoted, depIdPlain, missing, present] = match;
        const depId = depIdQuoted ?? depIdPlain;
        const dep = KNOWN[depId] ?? depTitle ?? depId;
        const need = wanted === "any version" ? "" : `, ${wanted}`;

        if (missing) {
          const solutions =
            depId === "fabric" || depId === "fabric-api"
              ? [
                  "Download Fabric API for your game version from modrinth.com/mod/fabric-api and put it in the mods folder.",
                ]
              : [`Download ${dep} for your game version and for Fabric, and put it in the mods folder.`];
          solutions.push(`Or remove ${modName} if you don't need it.`);
          return {
            key: `${modId}>${depId}`,
            message: `${modName} needs ${dep}${need}, which isn't installed.`,
            solutions,
          };
        }

        const have = limit(present ?? "another version", 60);
        const solutions =
          depId === "fabricloader"
            ? [
                "Update Fabric Loader. In your launcher, reinstall Fabric for this instance with the newest loader, or run the Fabric installer again.",
              ]
            : depId === "minecraft"
              ? [
                  `Download the version of ${modName} made for Minecraft ${have}, or run the Minecraft version it was made for.`,
                ]
              : depId === "java"
                ? [`Run the game with the Java version ${modName} asks for.`]
                : [
                    `Replace ${dep} with a version that fits (${wanted}). Update the mods that depend on it to match.`,
                  ];
        solutions.push(`Or remove ${modName} if you don't need it.`);
        return {
          key: `${modId}>${depId}`,
          message: `${modName} needs ${dep}${need}, but you have ${have}.`,
          solutions,
        };
      }
    }

    if (short.includes(" is incompatible with ")) {
      const match = BREAKS.exec(short);
      if (match) {
        const [, name, id, otherTitle, otherIdQuoted, otherIdPlain] = match;
        const otherId = otherIdQuoted ?? otherIdPlain;
        const other = KNOWN[otherId] ?? otherTitle ?? otherId;
        return {
          key: `${id}!${otherId}`,
          message: `${name} and ${other} can't be used together.`,
          solutions: [
            `Remove ${name} or ${other}, whichever you need less.`,
            "Check both mods for a newer version. The authors sometimes fix a clash like this in an update.",
          ],
        };
      }
    }

    return null;
  },
};
