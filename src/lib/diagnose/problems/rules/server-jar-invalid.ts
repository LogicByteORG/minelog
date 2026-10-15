import type { Rule } from "../types";

const ACCESS = /Error: Unable to access jarfile (\S{1,120})/;
const CORRUPT = /Error: Invalid or corrupt jarfile (\S{1,120})/;
const MANIFEST = /no main manifest attribute, in (\S{1,120})|Failed to load Main-Class manifest attribute/;

export const serverJarInvalid: Rule = {
  id: "server-jar-invalid",
  read(line) {
    const short = line.slice(0, 1000);

    const access = ACCESS.exec(short);
    if (access) {
      return {
        key: "access",
        message: `Java couldn't open ${access[1]}, so the server never started.`,
        solutions: [
          "Check that the file is in the same folder as the start command, and that its name matches exactly, including upper and lower case.",
          "On a hosting panel, the jar name in the startup settings has to match the file name in the file manager.",
          "Rename the file to something without spaces, like server.jar, and use that name in the start command.",
        ],
      };
    }

    const corrupt = CORRUPT.exec(short);
    if (corrupt) {
      return {
        key: "corrupt",
        message: `${corrupt[1]} isn't a complete jar file, so Java refused to run it.`,
        solutions: [
          "Delete it and download or upload it again. A transfer that stopped halfway is the usual cause.",
          "A server jar is tens of megabytes. If the file is only a few kilobytes, the download failed.",
        ],
      };
    }

    if (!MANIFEST.test(short)) return null;
    return {
      key: "manifest",
      message: "That file is a valid jar, but it isn't one Java can run as a server.",
      solutions: [
        "Make sure you start the server jar and not a plugin, mod or library jar.",
        "For a Forge or NeoForge server, run the installer first, then start the jar or the run script it created.",
      ],
    };
  },
};
