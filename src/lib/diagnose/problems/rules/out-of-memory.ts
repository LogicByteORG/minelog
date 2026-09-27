import type { Rule } from "../types";

const PATTERN = /java\.lang\.OutOfMemoryError: (Java heap space|GC overhead limit exceeded)/;

export const outOfMemory: Rule = {
  id: "out-of-memory",
  read(line, { kind }) {
    const match = PATTERN.exec(line);
    if (!match) return null;

    const where =
      kind === "server"
        ? "On a hosting panel, raise the RAM setting. On your own machine, raise -Xmx in the start command."
        : "In your launcher, raise the memory setting for this instance, or the -Xmx value in its Java arguments.";

    return {
      key: "heap",
      message: "Java ran out of the memory it was allowed to use.",
      solutions: [
        `${where} For example, -Xmx4G allows 4 GB.`,
        "If it comes back after an hour or two of playing, a mod or plugin may be leaking memory. Remove the ones you added last and test again.",
      ],
    };
  },
};

