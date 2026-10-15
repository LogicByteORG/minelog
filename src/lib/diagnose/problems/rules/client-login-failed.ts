import type { Rule } from "../types";

const SESSION = /Invalid session \(try restarting your game/i;
const UNREACHABLE = /The authentication servers are currently not reachable/;
const PRIVILEGES = /Multiplayer is disabled\. Please check your Microsoft account settings/;
const BANNED = /You are banned from playing online/;

export const clientLoginFailed: Rule = {
  id: "client-login-failed",
  read(line) {
    const short = line.slice(0, 1000);

    if (SESSION.test(short)) {
      return {
        key: "session",
        message: "The game says your login session is no longer valid, so it can't join online servers.",
        solutions: [
          "Close the game and the launcher completely, then open the launcher again and start the game.",
          "If it persists, sign out of your account in the launcher and sign in again.",
        ],
      };
    }

    if (UNREACHABLE.test(short)) {
      return {
        key: "unreachable",
        message: "The game couldn't reach Mojang's login servers, so it can't check your account.",
        solutions: [
          "Wait a few minutes and try again. Their servers have short outages that clear on their own.",
          "Check that your internet works, and that a VPN, firewall or antivirus isn't blocking Java or the launcher.",
        ],
      };
    }

    if (PRIVILEGES.test(short)) {
      return {
        key: "privileges",
        message: "Your Microsoft account has multiplayer turned off, so the game won't let you join online servers.",
        solutions: [
          "Sign in at account.microsoft.com and open the Xbox privacy settings for this account. Allow joining multiplayer games, then restart the game.",
          "If it's a child account, an adult in the family group has to allow it.",
        ],
      };
    }

    if (BANNED.test(short)) {
      return {
        key: "banned",
        message: "Your account has an online play ban, which is separate from any single server's ban.",
        solutions: [
          "Check the email address of the Microsoft account for the notice. It says why and how to appeal.",
          "Singleplayer still works while the ban is active.",
        ],
      };
    }

    return null;
  },
};
