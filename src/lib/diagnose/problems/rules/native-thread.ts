import type { Rule } from "../types";

const PATTERN = /java\.lang\.OutOfMemoryError: unable to create (?:new )?native thread/;

export const nativeThread: Rule = {
  id: "native-thread",
  read(line) {
    if (!PATTERN.test(line)) return null;
    return {
      key: "thread",
      message: "Java couldn't start another thread. The system's limit was reached.",
      solutions: [
        "Don't add more memory. That usually makes this worse, because threads use memory outside the heap.",
        "Restart, and check whether a plugin or mod starts far too many threads. On a hosting plan, ask support whether it limits threads or processes.",
      ],
    };
  },
};

