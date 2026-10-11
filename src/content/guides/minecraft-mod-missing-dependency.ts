import type { Guide } from "./types";

export const MOD_MISSING_DEPENDENCY: Guide = {
  slug: "minecraft-mod-missing-dependency",
  path: "/guides/minecraft-mod-missing-dependency",
  title: "How to fix a mod that \"requires\" another mod",
  metaTitle: "Fix Minecraft \"requires ... which is missing\" mod error",
  description:
    "A mod that says it requires another mod, which is missing, needs that second mod installed. Here is how to read the message and fix it on Fabric and Forge.",
  lead: "A mod asked for another mod, or a certain version of one, and didn't find it. The message names both, so the fix is usually one download.",
  updated: "2026-10-11",
  related: ["minecraft-mixin-apply-failed", "minecraft-crash-report", "minecraft-java-version-error", "find-minecraft-logs"],
  sections: [
    {
      id: "fabric",
      heading: "What it looks like on Fabric",
      blocks: [
        {
          type: "code",
          caption: "An invented example",
          text: `Mod 'Iris Shaders' (iris) 1.7.0 requires version 0.6.0 or later of mod 'Sodium' (sodium), which is missing!`,
        },
        {
          type: "p",
          text: "The first name in quotes is the mod that's complaining. The second is the one it needs. `which is missing!` means it isn't in the `mods` folder at all. `but only the wrong versions are present: 0.5.8!` means it's there, but not a version that fits. And `is incompatible with` means the two can't run together.",
        },
      ],
    },
    {
      id: "forge",
      heading: "On Forge and NeoForge",
      blocks: [
        {
          type: "p",
          text: "Forge and NeoForge print a list headed `Missing or unsupported mandatory dependencies:` with lines like `Mod ID: 'geckolib', Requested by: 'examplemod', Expected range: '[4.4,)', Actual version: '[MISSING]'`. Read it the same way. `Requested by` is the mod that complains, `Mod ID` is what it needs, and `[4.4,)` means 4.4 or newer.",
        },
      ],
    },
    {
      id: "fix",
      heading: "Fix it",
      blocks: [
        {
          type: "steps",
          items: [
            "Find the exact name of the missing mod in the message.",
            "Download it from Modrinth or CurseForge for your Minecraft version and your loader. Fabric files don't load on Forge, and the other way round. Then drop the `.jar` into `mods`.",
            "If it says the wrong version is present, replace it with one inside the range, such as `0.6.0 or later`. Update the mods that depend on it to match.",
            "Many Fabric mods need Fabric API. It's a separate download from Fabric Loader and has to sit in `mods` too.",
            "Don't want the mod that complains? Take that one out instead.",
          ],
        },
      ],
    },
    {
      id: "incompatible",
      heading: "When two mods can't be used together",
      blocks: [
        {
          type: "p",
          text: "`is incompatible with` is a clash the authors know about. Remove whichever mod you need less, and check both for a newer version, because a clash is sometimes fixed in an update.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Send the log",
      blocks: [
        {
          type: "p",
          text: "If you can't tell which mod it means, send `latest.log` and the newest file in `crash-reports`. Drop them onto [minelog](/) for a link; it lists the missing mod in plain words once saved.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "What is Fabric API, and do I need it?",
      answer:
        "It's a library most Fabric mods build on. It isn't part of Fabric Loader, so you download it on its own and put it in the mods folder.",
    },
    {
      question: "What does \"or later\" mean?",
      answer:
        "That version or any newer one. A newer download is fine unless the message says an exact version.",
    },
    {
      question: "Why does it say a wrong version is present?",
      answer:
        "The mod is installed, but outside the range the other mod accepts. Update or downgrade it to fit, and update the mods that depend on it.",
    },
  ],
};
