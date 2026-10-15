import type { Rule } from "../types";

const OLDER_CLIENT = /Outdated client! Please use (\d[\w.-]{0,20})/;
const OLDER_SERVER = /Outdated server! I'm still on (\d[\w.-]{0,20})/;
const INCOMPATIBLE = /Incompatible client! Please use (\d[\w.-]{0,20})/;

const VIA =
  "To let newer or older players in without changing the server, install ViaVersion, with ViaBackwards for older clients. Put them on the proxy or on the backend server, not on both.";

export const versionMismatch: Rule = {
  id: "version-mismatch",
  read(line) {
    const short = line.slice(0, 1000);

    const older = OLDER_CLIENT.exec(short);
    if (older) {
      return {
        key: `old-client/${older[1]}`,
        message: `A player joined with a game version older than the server's, which is ${older[1]}.`,
        solutions: [
          `Start the game on version ${older[1]}. In the launcher, pick or create an installation with that exact version.`,
          VIA,
        ],
      };
    }

    const newer = OLDER_SERVER.exec(short);
    if (newer) {
      return {
        key: `old-server/${newer[1]}`,
        message: `A player joined with a game version newer than the server's, which is still on ${newer[1]}.`,
        solutions: [
          `Start the game on version ${newer[1]}, or update the server to the version the players use.`,
          VIA,
        ],
      };
    }

    const mismatch = INCOMPATIBLE.exec(short);
    if (!mismatch) return null;
    return {
      key: `incompatible/${mismatch[1]}`,
      message: `A player's game version doesn't match the server, which wants ${mismatch[1]}.`,
      solutions: [
        `Start the game on version ${mismatch[1]}. In the launcher, pick or create an installation with that exact version.`,
        VIA,
      ],
    };
  },
};
