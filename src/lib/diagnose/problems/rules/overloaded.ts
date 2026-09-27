import type { Rule } from "../types";

const PATTERN =
  /Can't keep up! (?:Is the server overloaded|Did the system time change, or is the server overloaded)\?/;

export const overloaded: Rule = {
  id: "server-overloaded",
  minCount: 3,
  read(line) {
    if (!PATTERN.test(line)) return null;
    return {
      key: "ticks",
      message: "The server keeps falling behind its 20 ticks per second, so players see lag.",
      solutions: [
        "Lower view-distance and simulation-distance in server.properties. It's the quickest way to cut the work per tick.",
        "Install the spark plugin or mod and run /spark profiler. It shows which plugin, mod or activity uses the most tick time.",
        "Pre-generate the world with a tool like Chunky, so nobody triggers chunk generation during play.",
        "Remove plugins and mods you don't use, and shrink big farms and crowded animal pens.",
      ],
    };
  },
};

