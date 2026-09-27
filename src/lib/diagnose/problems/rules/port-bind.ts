import type { Rule } from "../types";

const PATTERN = /FAILED TO BIND TO PORT/i;

export const portBind: Rule = {
  id: "port-bind",
  read(line) {
    if (!PATTERN.test(line)) return null;
    return {
      key: "bind",
      message: "The server couldn't use its port, so it didn't start.",
      solutions: [
        "Another program probably has the port. Stop any other server or Java process that's still running, then start again.",
        "Check the server-ip line in server.properties. It should be empty, unless you know the address belongs to this computer.",
        "Or set server-port to another number, like 25566, and add that port to the address when you join.",
      ],
    };
  },
};

