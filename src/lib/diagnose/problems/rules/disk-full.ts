import type { Rule } from "../types";

const PATTERN = /No space left on device|There is not enough space on the disk|Disk quota exceeded/;

export const diskFull: Rule = {
  id: "disk-full",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "space",
      message: "The disk is full, so the game or server can't write files.",
      solutions: [
        "Stop the server until there is room. A failed write can leave a chunk or player file half written.",
        "Free up space. Old backups, crash-reports, logs and unused world copies are the usual big ones. On a hosting panel, check the storage limit of your plan.",
        "After you restart, look for Failed to store chunk errors. If the world misbehaves, restore it from the last backup.",
      ],
    };
  },
};
