import type { Rule } from "../types";

const PATTERN =
  /The directories below appear to be extracted jar files\. Fix this before you continue|Extracted mod jars found, loading will NOT continue/;

export const extractedMods: Rule = {
  id: "extracted-mods",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "extracted",
      message: "A mod was unzipped into the mods folder, so loading stopped.",
      solutions: [
        "Open the mods folder and delete any folder that holds an unzipped mod. Mods have to stay as .jar files.",
        "Download the mod again and drop the .jar in as it is. Some zip tools unpack a download automatically, so check your settings.",
      ],
    };
  },
};
