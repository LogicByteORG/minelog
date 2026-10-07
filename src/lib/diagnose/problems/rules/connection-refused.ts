import type { Rule } from "../types";

const PATTERN = /Connection refused(?:: (?:no further information|getsockopt))?/;

export const connectionRefused: Rule = {
  id: "connection-refused",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "refused",
      message: "Nothing answered at the address and port that was tried.",
      solutions: [
        "Check that the server is running and that the address and port are right. Minecraft's default port is 25565.",
        "If the server runs on your own computer, allow Java through the firewall. Friends outside your network also need the port forwarded on your router.",
        "Behind a proxy, make sure the address in the proxy's config points at the port the backend server really uses.",
      ],
    };
  },
};
