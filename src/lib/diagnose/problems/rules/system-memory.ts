import type { Rule } from "../types";

const PATTERN = /There is insufficient memory for the Java Runtime Environment to continue/;

export const systemMemory: Rule = {
  id: "system-memory",
  read(line) {
    if (!PATTERN.test(line)) return null;
    return {
      key: "system",
      message: "The computer ran out of memory, so Java couldn't continue.",
      solutions: [
        "Lower the -Xmx value. Java was probably given more than the computer can spare.",
        "Close other programs, then start again.",
      ],
    };
  },
};

