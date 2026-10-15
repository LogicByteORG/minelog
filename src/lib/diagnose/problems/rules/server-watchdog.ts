import type { Rule } from "../types";

const TICK = /A single server tick took (\d+(?:\.\d+)?) seconds \(should be max (\d+(?:\.\d+)?)\)/;
const STOPPED = /The server has stopped responding! This is \(probably\) not a [\w.-]{1,30} bug/;
const SHUTDOWN = /Considering it to be crashed, server will forcibly shutdown/;

export const serverWatchdog: Rule = {
  id: "server-watchdog",
  read(line) {
    const short = line.slice(0, 1000);
    const tick = TICK.exec(short);
    if (!tick && !STOPPED.test(short) && !SHUTDOWN.test(short)) return null;

    const message = tick
      ? `One server tick took ${tick[1]} seconds when it should take ${tick[2]}, so the watchdog shut the server down on purpose.`
      : "The server's main thread got stuck for too long, so the watchdog shut it down on purpose.";

    return {
      key: "freeze",
      message,
      solutions: [
        "Read the thread dump right under this line, in the block called Server thread. The plugin, mod or world task named there is what the server was stuck on.",
        "If the dump shows a world save or a big edit, the server was asked to do more than it can in one go. Split large WorldEdit jobs into smaller ones and pre-generate the world with Chunky.",
        "Raise timeout-time in spigot.yml, or max-tick-time in server.properties on a vanilla server, only as a last step. It swaps the crash for long freezes.",
      ],
    };
  },
};
