import type { Rule } from "../types";

const PATTERN = /Attempted to load class (\S+) for invalid dist DEDICATED_SERVER/;

export const invalidDist: Rule = {
  id: "client-code-on-server",
  read(line) {
    const match = PATTERN.exec(line);
    if (!match) return null;

    const name = match[1].replaceAll("/", ".");
    return {
      key: "dist",
      message: `Code that only exists on the client (${name}) was loaded on a server.`,
      solutions: [
        "A mod made for players is probably in the server's mods folder. Remove client-only mods from the server.",
        "Check each mod's page. Many say whether they are client side, server side or both, and some have a separate server download.",
      ],
    };
  },
};

