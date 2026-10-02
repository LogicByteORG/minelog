import type { Rule } from "../types";

const SERVER_FULL = /[Tt]he server is full!?|[Ss]erver is full!/;

export const serverFull: Rule = {
  id: "server-full",
  read(line) {
    if (!SERVER_FULL.test(line.slice(0, 1000))) return null;
    return {
      key: "full",
      message: "Someone tried to join but the server was full.",
      solutions: [
        "Raise max-players in server.properties if the machine can handle more players.",
        "Check if old sessions are stuck. A restart clears them.",
      ],
    };
  },
};
