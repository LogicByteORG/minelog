import type { Rule } from "../types";

const PATTERN = /java\.net\.BindException: Cannot assign requested address/;

export const bindAddress: Rule = {
  id: "bind-address",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "address",
      message: "The server was told to use an address that doesn't belong to this machine.",
      solutions: [
        "Open server.properties and clear the server-ip line. Leave it empty unless you know the address is this computer's own.",
        "On a host with a panel, set the IP back to the default one the panel gives you.",
        "Start the server again. Players still join with your public address, the setting only picks what the server listens on.",
      ],
    };
  },
};
