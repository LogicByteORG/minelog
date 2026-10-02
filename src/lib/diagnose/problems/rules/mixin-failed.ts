import type { Rule } from "../types";

const APPLY_FAILED = /Mixin apply failed|Mixin .* failed to apply/;
const TRANSFORMER_ERROR = /MixinTransformerError/;
const APPLY_ERROR = /MixinApplyError/;

export const mixinFailed: Rule = {
  id: "mixin-failed",
  read(line) {
    if (!APPLY_FAILED.test(line) && !TRANSFORMER_ERROR.test(line) && !APPLY_ERROR.test(line)) {
      return null;
    }
    return {
      key: "mixin",
      message: "A mod tried to change the game's code and it failed.",
      solutions: [
        "Remove the mods you added last and test again. The newest one is usually the cause.",
        "Make sure every mod matches your game version and your loader (Fabric mods need Fabric, Forge mods need Forge).",
        "Update the failing mod and its library mods, like MixinExtras or Architectury, to their newest versions.",
      ],
    };
  },
};
