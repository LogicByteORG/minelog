import type { Rule } from "../types";

const UNAVAILABLE = /Couldn't verify username because servers are unavailable/;
const FAILED = /Failed to verify username/;

export const loginVerificationFailed: Rule = {
  id: "login-verification-failed",
  read(line) {
    if (UNAVAILABLE.test(line)) {
      return {
        key: "unavailable",
        message: "The server couldn't reach Mojang's login servers to check a player's account.",
        solutions: [
          "Wait a few minutes and have the player try again. Mojang's login servers have short outages that clear on their own.",
          "Check that the server itself has internet access and can look up addresses, for example sessionserver.mojang.com.",
          "If this server sits behind a proxy like Velocity or BungeeCord, only the proxy should check accounts. Set online-mode=false on the servers behind it.",
        ],
      };
    }
    if (FAILED.test(line)) {
      return {
        key: "username",
        message: "A player's account couldn't be verified, so they were kicked.",
        solutions: [
          "Ask the player to close the game and launcher, sign in again, and rejoin.",
          "If the server is behind a proxy, check that online-mode matches how the proxy is set up. Mixing the two settings makes every player fail.",
          "Only turn online-mode off in server.properties if you know why. Without a proxy it lets anyone join under any name.",
        ],
      };
    }
    return null;
  },
};
