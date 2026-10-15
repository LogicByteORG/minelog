import type { Rule } from "../types";

const PATTERN = /You are not white-?listed on this server/i;

export const notWhitelisted: Rule = {
  id: "not-whitelisted",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "whitelist",
      message: "A player was turned away because the whitelist is on and their name isn't on it.",
      solutions: [
        "Add the player with /whitelist add followed by their name, in the console or as an operator. /whitelist list shows who is on it.",
        "If the name is on the list and it still fails, check whether online-mode was switched. Online and offline players have different IDs, so add the name again after the switch.",
        "To let everyone in, run /whitelist off, or set white-list=false in server.properties and restart.",
      ],
    };
  },
};
