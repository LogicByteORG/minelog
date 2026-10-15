import type { Rule } from "../types";

const KEY = /Expired profile public key|Invalid signature for profile public key|Missing profile public key|multiplayer\.disconnect\.missing_public_key/;
const CHAT =
  /Out-of-order chat packet received|Chat message validation failure|Received a chat packet with a missing or invalid signature|Too many unacknowledged chat messages/;

export const profileKeyError: Rule = {
  id: "profile-key-error",
  read(line) {
    const short = line.slice(0, 1000);

    if (KEY.test(short)) {
      return {
        key: "key",
        message: "The server couldn't accept a player's chat signing key, so it kicked them.",
        solutions: [
          "Ask the player to close the game and the launcher, sign in again, and rejoin. That fetches a fresh key.",
          "Check that the player's computer has the right date and time. An expired key almost always means the clock is off.",
          "As an admin, set enforce-secure-profile=false in server.properties to let players without a valid key join. It also turns off the signed chat checks.",
        ],
      };
    }

    if (CHAT.test(short)) {
      return {
        key: "chat",
        message: "The server kicked a player over a chat message it couldn't validate.",
        solutions: [
          "Check that the player's computer has the right date and time, then restart the game.",
          "A plugin or proxy that edits chat messages can break their signatures. Update it, or set enforce-secure-profile=false in server.properties.",
        ],
      };
    }

    return null;
  },
};
