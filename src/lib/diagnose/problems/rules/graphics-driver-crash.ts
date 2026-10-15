import type { Rule } from "../types";

const FRAME =
  /\[((?:nvoglv|ig\d+icd|atio6axx|atioglxx)\w*\.dll|libnvidia-glcore\.so[\d.]*|(?:iris|i965|radeonsi|nouveau)_dri\.so)\+0x[0-9a-f]+\]/i;

function vendorOf(file: string): string {
  const name = file.toLowerCase();
  if (name.startsWith("nvoglv") || name.startsWith("libnvidia")) return "NVIDIA";
  if (name.startsWith("ig") || name.startsWith("iris") || name.startsWith("i965")) return "Intel";
  if (name.startsWith("atio") || name.startsWith("radeonsi")) return "AMD";
  return "open-source Nouveau";
}

export const graphicsDriverCrash: Rule = {
  id: "graphics-driver-crash",
  read(line) {
    const match = FRAME.exec(line.slice(0, 600));
    if (!match) return null;
    const vendor = vendorOf(match[1]);
    return {
      key: vendor,
      message: `Java crashed inside the ${vendor} graphics driver (${match[1]}), so the fault is in the driver or in what the game asked it to draw.`,
      solutions: [
        `Update the ${vendor} graphics driver from the ${vendor} website. If the crash began right after a driver update, install the previous version instead.`,
        "Turn off shaders, heavy resource packs and mods that change rendering, then test again.",
        "If it keeps happening, send the hs_err file to the driver's vendor. The crash is inside their code.",
      ],
    };
  },
};
