import type { Rule } from "../types";

const PATTERN = /Unrecognized (?:VM )?option(?::\s*|\s+')([^'\s]{1,80})/;

export const jvmBadOption: Rule = {
  id: "jvm-bad-option",
  read(line) {
    const match = PATTERN.exec(line.slice(0, 1000));
    if (!match) return null;
    const option = match[1];
    return {
      key: option,
      message: `Java doesn't know the start option ${option}, so it refused to start.`,
      solutions: [
        `Remove ${option} from the Java arguments in your launcher, or from the start command or script of the server.`,
        "Options written for an older Java often don't exist in a newer one. Copied start flags from an old guide are the usual cause.",
        "If you do need that option, run the game with the Java version the guide was written for.",
      ],
    };
  },
};
