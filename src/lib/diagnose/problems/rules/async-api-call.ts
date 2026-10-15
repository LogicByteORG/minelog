import type { Rule } from "../types";

const THROWN = /IllegalStateException: Asynchronous ([A-Za-z][\w .:/'-]{2,80}?)!/;
const CHECKED = /failed main thread check: ([A-Za-z][\w .:/'-]{2,80}?)\s*$/;

export const asyncApiCall: Rule = {
  id: "async-api-call",
  read(line) {
    const short = line.slice(0, 1000);
    const match = THROWN.exec(short) ?? CHECKED.exec(short);
    if (!match) return null;
    const reason = match[1].trim();
    return {
      key: reason.toLowerCase(),
      message: `A plugin tried to do "${reason}" from a background thread, and the server only allows that on its main thread.`,
      solutions: [
        "Look at the stack trace under this line. The first frame with a plugin's own package name shows which plugin did it.",
        "Update that plugin to the newest build for your server version. Calling the server from the wrong thread is a plugin bug, and the author has to fix it.",
        "If it keeps happening after an update, send the author this stack trace, or remove the plugin until it's fixed.",
      ],
    };
  },
};
