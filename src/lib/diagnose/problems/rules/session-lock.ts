import type { Rule } from "../types";

const LOCKED =
  /Failed to check session lock, aborting|The save is being accessed from another location|already locked \(possibly by other Minecraft instance\?\)|DirectoryLock\$LockException|SessionLock\$\w*Lock\w*Exception/;
const DENIED = /AccessDeniedException: [^\n]{0,200}session\.lock/;

export const sessionLock: Rule = {
  id: "session-lock",
  read(line) {
    const short = line.slice(0, 1000);

    if (DENIED.test(short)) {
      return {
        key: "permission",
        message: "The server isn't allowed to use the world's session.lock file.",
        solutions: [
          "Check who owns the world folder. The user that runs the server needs read and write access to the folder and everything in it. Copying a world with another account is the usual way this goes wrong.",
          "Fix the permissions, then start again. The server writes a fresh session.lock on its own.",
        ],
      };
    }

    if (!LOCKED.test(short)) return null;
    return {
      key: "locked",
      message: "Another program has this world open, so this one can't use it.",
      solutions: [
        "Make sure only one server or game uses this world folder. A Java process left over from an earlier crash is the usual cause, so end it and start again.",
        "If nothing else is running, stop the server completely, copy the world folder somewhere safe, then delete session.lock inside the world folder. It's created again on start.",
        "Never point two servers at the same world folder. That is how worlds get damaged.",
      ],
    };
  },
};
