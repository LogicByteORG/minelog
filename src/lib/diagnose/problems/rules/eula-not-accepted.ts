import type { Rule } from "../types";

const PATTERN = /You need to agree to the EULA in order to run the server/;

export const eulaNotAccepted: Rule = {
  id: "eula-not-accepted",
  read(line) {
    if (!PATTERN.test(line)) return null;
    return {
      key: "eula",
      message: "The server won't start until you accept Minecraft's EULA.",
      solutions: [
        "Open eula.txt in the server folder, change eula=false to eula=true and save the file.",
        "Then start the server again. On a hosting panel, edit eula.txt in the file manager or switch on the EULA option if there is one.",
        "The EULA is Mojang's terms for running a server. You can read it at https://aka.ms/MinecraftEULA before you accept.",
      ],
    };
  },
};
