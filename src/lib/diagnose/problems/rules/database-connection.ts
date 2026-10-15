import type { Rule } from "../types";

const UNREACHABLE = /Communications link failure|CommunicationsException/;
const DENIED = /Access denied for user '[^']{1,60}'@'[^']{1,80}'/;
const UNKNOWN = /Unknown database '[^']{1,60}'/;

export const databaseConnection: Rule = {
  id: "database-connection",
  read(line) {
    const short = line.slice(0, 1000);

    if (UNREACHABLE.test(short)) {
      return {
        key: "unreachable",
        message: "A plugin couldn't reach its database at all.",
        solutions: [
          "Check the host and port in the plugin's config. A typo there is the most common cause.",
          "Check that the database server is running and reachable from the game server's machine. A firewall or a database that only listens on 127.0.0.1 blocks a database on another machine.",
          "Read the Caused by line below this one. It often adds the exact reason, like a timeout or a refused connection.",
        ],
      };
    }

    if (DENIED.test(short)) {
      return {
        key: "denied",
        message: "The database refused the plugin's login.",
        solutions: [
          "Check the username and password in the plugin's config.",
          "Make sure that database user is allowed to connect from the game server's address, not only from localhost. Your host or database panel has that setting.",
        ],
      };
    }

    if (UNKNOWN.test(short)) {
      return {
        key: "missing",
        message: "The database server answered, but the database name in the plugin's config doesn't exist there.",
        solutions: [
          "Check the database name in the plugin's config for a typo.",
          "Create the database on the server first. Plugins create their tables, but most don't create the database itself.",
        ],
      };
    }

    return null;
  },
};
