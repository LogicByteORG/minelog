import type { Rule } from "../types";

const PATTERN = /Flying is not enabled on this server/;

export const flyingKick: Rule = {
  id: "flying-kick",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "fly",
      message: "A player was kicked for flying, because the server doesn't allow flight.",
      solutions: [
        "If the flying is expected, set allow-flight=true in server.properties and restart. Fly mods, jetpacks and flight plugins need it, and so do some elytra and movement setups.",
        "The server counts a player as flying when they float for several seconds. A mod or plugin that gives movement abilities is the usual trigger.",
        "If nobody should be able to fly, the kick is the server doing its job. Look at who it was.",
      ],
    };
  },
};
