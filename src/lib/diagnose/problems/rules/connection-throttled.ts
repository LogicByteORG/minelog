import type { Rule } from "../types";

const PATTERN = /Connection throttled! Please wait before reconnecting/;

export const connectionThrottled: Rule = {
  id: "connection-throttled",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "throttle",
      message: "The server turned a player away because they reconnected too quickly.",
      solutions: [
        "Wait a few seconds before joining again. Every quick retry restarts the wait.",
        "Behind a proxy, every player arrives from the proxy's address, so the backend can throttle all of them at once. Set connection-throttle to -1 in bukkit.yml on the backend, and throttle on the proxy instead.",
        "On a server without a proxy, connection-throttle in bukkit.yml is the gap in milliseconds between logins from one address. The default is 4000, and -1 turns it off.",
      ],
    };
  },
};
