import type { Guide } from "./types";

export const MOD_MISSING_DEPENDENCY: Guide = {
  slug: "minecraft-mod-missing-dependency",
  path: "/guides/minecraft-mod-missing-dependency",
  title: "How to fix a mod that \"requires\" another mod",
  metaTitle: "Fix Minecraft \"requires ... which is missing\" mod error",
  description:
    "If a mod says another mod is missing, the fix is installing that second mod. We show how to read the message on Fabric and Forge.",
  lead: "You installed a mod, and it went looking for another one, or for a particular version of it, and came back empty-handed. The message names exactly what's missing, which is why the cure is so often a single download.",
  updated: "2026-10-11",
  related: ["minecraft-mixin-apply-failed", "minecraft-crash-report", "minecraft-java-version-error", "find-minecraft-logs"],
  sections: [
    {
      id: "fabric",
      heading: "How Fabric words it",
      blocks: [
        {
          type: "code",
          caption: "An invented example",
          text: `Mod 'Iris Shaders' (iris) 1.7.0 requires version 0.6.0 or later of mod 'Sodium' (sodium), which is missing!`,
        },
        {
          type: "p",
          text: "Read the quoted names left to right: the first is the mod that's grumbling and the second is the one it wants. The end of the sentence is the real clue. If it says `which is missing!`, the mod isn't in your `mods` folder at all, and if it says `but only the wrong versions are present: 0.5.8!`, you've got it, just not a version that works. Seeing `is incompatible with` means the two simply refuse to share a game.",
        },
      ],
    },
    {
      id: "forge",
      heading: "How Forge and NeoForge word it",
      blocks: [
        {
          type: "p",
          text: "They print a whole list under `Missing or unsupported mandatory dependencies:`, and each entry looks something like `Mod ID: 'geckolib', Requested by: 'examplemod', Expected range: '[4.4,)', Actual version: '[MISSING]'`. It reads the same way. The mod that complains is `Requested by`, what it needs is the `Mod ID`, and `[4.4,)` just means 4.4 or anything newer.",
        },
      ],
    },
    {
      id: "fix",
      heading: "Sorting it out",
      blocks: [
        {
          type: "p",
          text: "First, copy the exact name of the missing mod out of the message. Grab it from Modrinth or CurseForge, checking that it matches your Minecraft version and your loader (a Fabric file won't load on Forge and vice versa), and drop the `.jar` into `mods`. If the complaint was about a wrong version, swap in one inside the range, like `0.6.0 or later`, and update whatever depends on it. Fabric players meet this one a lot, because plenty of mods need Fabric API. It isn't bundled with Fabric Loader, so it's its own download and it has to live in `mods` as well. Or you can decide the mod that's complaining isn't worth the trouble and delete it.",
        },
      ],
    },
    {
      id: "incompatible",
      heading: "When two mods clash",
      blocks: [
        {
          type: "p",
          text: "The words `is incompatible with` mean the authors already know these two don't get along. Pick whichever one you can live without and remove it, but peek at both for a newer release first, since clashes do get fixed.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Getting help",
      blocks: [
        {
          type: "p",
          text: "Can't work out which mod it means? Send `latest.log` and the newest file in `crash-reports`. Drop them onto [minelog](/) and, once it's saved, you get a link that lists the missing mod in plain words.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "What is Fabric API, and do I need it?",
      answer:
        "It's a library most Fabric mods build on. Since it isn't part of Fabric Loader, you download it on its own and put it in the mods folder.",
    },
    {
      question: "What does \"or later\" mean?",
      answer:
        "That version or any newer one. Unless the message asks for an exact version, a newer download is fine.",
    },
    {
      question: "Why does it say a wrong version is present?",
      answer:
        "The mod is installed, but outside the range the other mod accepts. Update or downgrade it until it fits, and update the mods that depend on it too.",
    },
  ],
};
