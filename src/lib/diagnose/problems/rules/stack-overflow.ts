import type { Rule } from "../types";

const PATTERN = /java\.lang\.StackOverflowError/;

export const stackOverflow: Rule = {
  id: "stack-overflow",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "stack",
      message: "Something called itself over and over until Java ran out of stack.",
      solutions: [
        "Look at the first few frames under this line. The same method repeating tells you which mod or plugin is looping.",
        "Update that mod or plugin, and any mod it works with. Two mods that hook the same thing can trigger each other forever.",
        "If it started after you added a mod, remove that one first. A very deep world feature or a huge data pack can cause it too.",
        "Raising the stack size with -Xss4M in the Java arguments only hides a real loop, so use it as a last step.",
      ],
    };
  },
};
