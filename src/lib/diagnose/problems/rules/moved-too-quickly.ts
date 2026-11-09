import type { Rule } from "../types";

const PATTERN = /(?:^|\s|:)(?:(\S{1,40}) )?[Mm]oved (too quickly|wrongly)!/;

export const movedTooQuickly: Rule = {
  id: "moved-too-quickly",
  minCount: 5,
  read(line) {
    const match = PATTERN.exec(line.slice(0, 400));
    if (!match) return null;
    const wrongly = match[2] === "wrongly";
    return {
      key: wrongly ? "wrongly" : "quickly",
      message: wrongly
        ? "The server keeps rejecting player positions as impossible (moved wrongly)."
        : "The server keeps seeing players move faster than it allows (moved too quickly).",
      solutions: [
        "Lag is the most common cause. When the server falls behind, a player's moves arrive in bursts and look too fast. Check for \"Can't keep up\" lines and fix those first.",
        "Teleport plugins, speed effects, elytra boosts and some mods can trigger it on purpose. If it only happens after a teleport or a boost, it's usually harmless.",
        "Players with a high ping or a bad connection show up here a lot. Check who the line names before blaming the server.",
        "A few repeats are normal. Hundreds in a row point to a movement mod, an anti-cheat plugin that's too strict, or a laggy server.",
      ],
    };
  },
};
