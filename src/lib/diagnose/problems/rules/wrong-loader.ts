import type { Rule } from "../types";

const LANGUAGE = /Missing language (\w+) version ([^ ]{1,40}) wanted by ([^ ,:\]]{1,120}\.jar), found (\S{1,20})/;

export const wrongLoader: Rule = {
  id: "wrong-loader-mod",
  read(line) {
    const match = LANGUAGE.exec(line.slice(0, 1000));
    if (!match) return null;
    const jar = match[3].split(/[\\/]/).pop() ?? match[3];
    const shortJar = jar.length > 60 ? jar.slice(0, 60) : jar;
    return {
      key: `${shortJar}/${match[1]}`,
      message: `${shortJar} was made for a different loader, so this loader skips it.`,
      solutions: [
        `Remove ${shortJar} or download the version made for your loader and game version.`,
        "A file name with fabric in it belongs on Fabric, and a file with forge in it belongs on Forge or NeoForge. Mixed folders crash on startup.",
      ],
    };
  },
};
