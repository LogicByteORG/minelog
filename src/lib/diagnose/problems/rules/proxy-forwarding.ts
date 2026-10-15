import type { Rule } from "../types";

const SECRET = /Unable to verify player details/;
const BUNGEE = /If you wish to use IP forwarding, please enable it in your BungeeCord config as well/;
const VELOCITY_ONLY = /This server requires you to connect with Velocity/;

export const proxyForwarding: Rule = {
  id: "proxy-forwarding",
  read(line) {
    const short = line.slice(0, 1000);

    if (SECRET.test(short)) {
      return {
        key: "secret",
        message: "The server turned a player away because Velocity's forwarding secret didn't check out.",
        solutions: [
          "Copy the text inside forwarding.secret from the Velocity folder and paste it as the secret under proxies > velocity in config/paper-global.yml on each Paper server. Restart both.",
          "Check that enabled is true in that same velocity section.",
          "Set online-mode=false in server.properties on the backend servers. Velocity checks the accounts, so the backend must not do it again.",
        ],
      };
    }

    if (BUNGEE.test(short)) {
      return {
        key: "direct",
        message: "A player reached the server directly, but it is set up to only accept players sent by a proxy.",
        solutions: [
          "Players have to join through the proxy's address, not the backend server's address and port.",
          "Block the backend's port from the outside with a firewall, so nobody can skip the proxy.",
          "If this server isn't behind a proxy at all, set bungeecord: false in spigot.yml.",
          "Behind BungeeCord, also check that ip_forward is true in the proxy's config.yml.",
        ],
      };
    }

    if (VELOCITY_ONLY.test(short)) {
      return {
        key: "velocity",
        message: "The server only accepts players coming through Velocity, and this one connected another way.",
        solutions: [
          "Join through the Velocity proxy's address, not the backend's.",
          "Make sure player-info-forwarding-mode is set to modern in velocity.toml, to match the Velocity setting on the backend.",
        ],
      };
    }

    return null;
  },
};
