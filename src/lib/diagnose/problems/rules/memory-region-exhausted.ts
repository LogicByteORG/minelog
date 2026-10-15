import type { Rule } from "../types";

const METASPACE = /java\.lang\.OutOfMemoryError: (?:Metaspace|Compressed class space)/;
const DIRECT = /java\.lang\.OutOfMemoryError: Direct buffer memory|Cannot reserve \d+ bytes of direct buffer memory/;

export const memoryRegionExhausted: Rule = {
  id: "memory-region-exhausted",
  read(line) {
    const short = line.slice(0, 1000);

    if (METASPACE.test(short)) {
      return {
        key: "metaspace",
        message: "Java ran out of room for class data (Metaspace), which is separate from the heap memory.",
        solutions: [
          "Raising -Xmx doesn't help here. Add -XX:MaxMetaspaceSize=1G to the start command, or use the Metaspace field if your hosting panel has one.",
          "Big modpacks load a lot of classes, so this shows up there first. Remove mods you don't need.",
        ],
      };
    }

    if (DIRECT.test(short)) {
      return {
        key: "direct",
        message: "Java ran out of off-heap memory, which the network code uses to move data around.",
        solutions: [
          "Leave memory free beyond -Xmx. The whole Java process needs more than the heap, so give the machine or the panel plan some headroom.",
          "Set -XX:MaxDirectMemorySize explicitly in the start command, and test with a bit more than the current limit.",
          "Many players or plugins that send large packets use more of it. Remove the newest plugins and test again.",
        ],
      };
    }

    return null;
  },
};
