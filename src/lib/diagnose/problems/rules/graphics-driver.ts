import type { Rule } from "../types";

const PATTERN =
  /The driver does not appear to support OpenGL|Pixel format not accelerated|GLX: Failed to create context|Couldn't set pixel format|GLFW error 65542/;

export const graphicsDriver: Rule = {
  id: "graphics-driver",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "driver",
      message: "Minecraft couldn't start its graphics. The video driver doesn't offer what the game needs.",
      solutions: [
        "Update your graphics driver from the NVIDIA, AMD or Intel website. The basic driver Windows installs by itself is often too old.",
        "On a laptop with two graphics chips, set javaw.exe to use the dedicated GPU in Windows graphics settings.",
        "Remote desktop sessions and virtual machines usually have no OpenGL. Start the game on the computer's own screen.",
        "Minecraft 1.17 and newer need OpenGL 3.2. Very old graphics chips, like the Intel HD 3000, can't run them.",
      ],
    };
  },
};
