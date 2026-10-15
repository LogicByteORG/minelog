import type { Rule } from "../types";

const PATTERN = /java\.net\.UnknownHostException(?::\s*([A-Za-z0-9._-]{1,120}))?/;

export const unknownHost: Rule = {
  id: "unknown-host",
  read(line, { kind }) {
    const match = PATTERN.exec(line.slice(0, 1000));
    if (!match) return null;
    const host = match[1] ?? "an address";

    if (kind === "client") {
      return {
        key: host,
        message: `The game couldn't find ${host}, so it never reached a server.`,
        solutions: [
          "Check the spelling of the server address. Leave out spaces and anything like https://, and keep the port after a colon.",
          "Check that your internet works, then try again. A short DNS hiccup clears on its own.",
          "If other servers work and only this one doesn't, the server's name may have expired or lost its DNS record. Ask its owner.",
        ],
      };
    }

    return {
      key: host,
      message: `The server couldn't look up ${host}, so whatever it was trying to reach failed.`,
      solutions: [
        "Check that the machine has working internet and a DNS resolver. On a hosting panel, contact the host if lookups fail for every address.",
        "Check that a firewall isn't blocking outgoing traffic from Java.",
        "If the address is one you typed in a config file, look for a typo.",
      ],
    };
  },
};
