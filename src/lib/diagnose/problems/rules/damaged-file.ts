import type { Rule } from "../types";

const PATTERN =
  /java\.util\.zip\.ZipException: (?:invalid distance too far back|zip END header not found|zip file is empty|error in opening zip file)/;

export const damagedFile: Rule = {
  id: "damaged-file",
  read(line) {
    if (!PATTERN.test(line)) return null;
    return {
      key: "zip",
      message: "A file in the game or server folder looks damaged, so Java can't open it.",
      solutions: [
        "Download the mod or plugin again from its official page and replace the file.",
        "Make sure the download finished. A file that's much smaller than the one on the page usually stopped halfway.",
        "If the damaged file belongs to the game itself, let your launcher repair or reinstall that version.",
      ],
    };
  },
};

