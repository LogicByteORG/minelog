import type { Guide } from "./types";

export const MIXIN_APPLY_FAILED: Guide = {
  slug: "minecraft-mixin-apply-failed",
  path: "/guides/minecraft-mixin-apply-failed",
  title: "How to fix \"Mixin apply failed\" in Minecraft",
  metaTitle: "Fix Minecraft \"Mixin apply failed\" crash",
  description:
    "A mod couldn't patch the game, usually thanks to a wrong version, a wrong loader or a clash with another mod. This is how you find which one.",
  lead: "A mod tried to change the game's code and couldn't. It's almost always one mod, either built for another version or clashing with a second one.",
  updated: "2026-10-11",
  related: ["minecraft-crash-report", "minecraft-mod-missing-dependency", "minecraft-java-version-error", "share-a-log-file-safely"],
  sections: [
    {
      id: "what-it-looks-like",
      heading: "What the error looks like",
      blocks: [
        {
          type: "code",
          caption: "An invented example, not a real mod",
          text: `[main/ERROR]: Mixin apply failed examplemod.mixins.json:ServerPlayerMixin -> net.minecraft.server.level.ServerPlayer
org.spongepowered.asm.mixin.injection.throwables.InvalidInjectionException: @Inject annotation on tick could not find any targets`,
        },
        {
          type: "p",
          text: "Mixin is the library many mods use to patch Minecraft's code while the game loads, and `Mixin apply failed` means one of those patches didn't fit. In the same report you may also see `MixinTransformerError`, `MixinApplyError` or `InvalidInjectionException`, which are the same story told by different classes.",
        },
      ],
    },
    {
      id: "why",
      heading: "Why a patch doesn't fit",
      blocks: [
        {
          type: "p",
          text: "A frequent reason is that the mod was built for another Minecraft version. Method names and signatures move between releases, so a patch written for 1.20.1 can miss on 1.21.1. Sometimes the mod is for another loader, like a Forge mod on Fabric or the other way round, or two mods patch the same method and the second one can't apply. A library mod can also be missing or too old, like MixinExtras or Architectury, and it happens a lot right after the game or the loader was updated and the mod wasn't.",
        },
      ],
    },
    {
      id: "which-mod",
      heading: "Finding which mod it is",
      blocks: [
        {
          type: "p",
          text: "The line names a mixin config such as `examplemod.mixins.json`, and the part before `.mixins.json` is nearly always the mod ID, so search your `mods` folder for it. On Forge and NeoForge, the `Suspected Mods:` line under System Details often names it too. And think back, because the mod you added or updated last is the likeliest suspect.",
        },
      ],
    },
    {
      id: "fix",
      heading: "Fixing it",
      blocks: [
        {
          type: "p",
          text: "Remove the mod the line names, or the newest one you added, and start the game. Then open the mod's page and download the file made for your exact Minecraft version and loader, and update its library mods along with Fabric API or the loader itself. Still failing? Move half your mods out of the folder, test, and keep halving until it stops. The last mod you moved back in is the one.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Sending the log",
      blocks: [
        {
          type: "p",
          text: "If you're asking for help, send `latest.log` and the newest file in `crash-reports`. Drop them onto [minelog](/) for a link, with IP addresses and the like hidden first. [How to find your Minecraft logs](/guides/find-minecraft-logs) shows where they are.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Is \"Mixin apply failed\" a crash?",
      answer:
        "Usually, yes. It normally stops the game while it loads, so you see it as a crash at startup or when a world opens.",
    },
    {
      question: "Will a newer Java fix it?",
      answer:
        "No, because a mixin error means a mod doesn't match the game or another mod. A Java mismatch looks different, usually as UnsupportedClassVersionError.",
    },
    {
      question: "Is my game installation broken?",
      answer:
        "No. The game files are fine and the mod is the problem, so take it out and you're back where you were.",
    },
  ],
};
