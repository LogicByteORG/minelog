import type { Rule } from "../types";

const PATTERN = /1282: Invalid operation|Maybe try a lower resolution resourcepack\?/;

export const openglInvalidOperation: Rule = {
  id: "opengl-invalid-operation",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "gl-1282",
      message: "The graphics driver rejected something the game drew (OpenGL error 1282).",
      solutions: [
        "Turn off your shader pack and see if the error goes away. Shader packs are the most common cause.",
        "If you added a mod just before it began, remove the newest one. Rendering mods that touch the same code can clash.",
        "Try a resource pack with a lower resolution, or none. Very large textures can trigger it.",
        "Update your graphics driver.",
      ],
    };
  },
};
