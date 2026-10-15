import type { Rule } from "../types";

const PATTERN = /java\.(?:io\.IOException|net\.SocketException): Too many open files/;

export const tooManyOpenFiles: Rule = {
  id: "too-many-open-files",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "files",
      message: "The system won't let Java open any more files or connections.",
      solutions: [
        "Raise the open files limit for the user that runs the server. With systemd, set LimitNOFILE in the service file. From a shell, set nofile in /etc/security/limits.conf.",
        "Check the limit the running process really has with cat /proc/<pid>/limits, because a shell can show a different number.",
        "If it only appears after the server has been up for hours, a plugin or mod may be leaking files. Remove the newest ones and test again.",
      ],
    };
  },
};
