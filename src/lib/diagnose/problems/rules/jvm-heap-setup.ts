import type { Rule } from "../types";

const PATTERN =
  /Could not reserve enough space for (?:object heap|\d{1,12}KB object heap)|Invalid maximum heap size|Invalid initial heap size|The specified size exceeds the maximum representable size|Too small maximum heap|Initial heap size set to a larger value than the maximum heap size/;

export const jvmHeapSetup: Rule = {
  id: "jvm-heap-setup",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "heap-setup",
      message: "Java couldn't set aside the memory it was asked for, so it never started.",
      solutions: [
        "You may be asking for more RAM than the computer has free. Lower the memory setting in your launcher, or -Xmx in the start command. For example, change -Xmx8G to -Xmx4G.",
        "A 32-bit Java can't hold more than about 1.5 GB. Install the 64-bit version of Java and pick it in your launcher.",
        "Make sure -Xms, the starting memory, is not bigger than -Xmx, the maximum.",
      ],
    };
  },
};
