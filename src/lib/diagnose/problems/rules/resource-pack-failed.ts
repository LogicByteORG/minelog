import type { Rule } from "../types";

const PATTERN =
  /Failed to (?:download|apply|load|reload) (?:the |a )?(?:server )?resource ?pack|Resource ?pack (?:download|loading|load) (?:has )?failed|Hash check failed for file|Server resource pack (?:download )?failed/i;

export const resourcePackFailed: Rule = {
  id: "resource-pack-failed",
  read(line) {
    if (!PATTERN.test(line.slice(0, 600))) return null;
    return {
      key: "pack",
      message: "A resource pack could not be downloaded or applied.",
      solutions: [
        "Open the pack's download link in a browser. It has to give the .zip file directly, and a Dropbox, Google Drive or GitHub page link won't work. Use a direct link.",
        "If the line mentions a hash, the sha1 in server.properties (resource-pack-sha1) doesn't match the file. Regenerate it from the exact file you host, or clear it.",
        "Check the pack format matches your game version. A pack made for a different version can fail to load or show as incompatible.",
        "Keep the pack under 250 MB on older clients, and make sure the host doesn't block downloads from other countries or from many players at once.",
      ],
    };
  },
};
