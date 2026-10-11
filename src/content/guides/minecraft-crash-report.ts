import type { Guide } from "./types";

export const CRASH_REPORT: Guide = {
  slug: "minecraft-crash-report",
  path: "/guides/minecraft-crash-report",
  title: "How to read a Minecraft crash report",
  metaTitle: "How to read a Minecraft crash report",
  description:
    "A crash report looks like a wall of text, but the answer is usually in three places. Learn what Description, the stack trace and Caused by lines mean.",
  lead: "Skip most of it. A crash report is long, but the answer is usually in a few lines close to the top.",
  updated: "2026-09-26",
  related: ["find-minecraft-logs", "minecraft-exception-in-server-tick-loop", "minecraft-mixin-apply-failed", "minecraft-out-of-memory-error"],
  sections: [
    {
      id: "whats-in-it",
      heading: "What's in a crash report",
      blocks: [
        {
          type: "p",
          text: "Open `crash-2026-09-20_20.49.02-client.txt` (or whichever file is newest) and you'll see the same layout every time: a `---- Minecraft Crash Report ----` banner, a joke comment, `Time:`, `Description:`, then the error. Here's an invented one:",
        },
        {
          type: "code",
          caption: "An invented example, not a real mod",
          text: `---- Minecraft Crash Report ----
// Why did you do that?

Time: 2026-09-20 20:49:02
Description: Ticking entity

java.lang.NullPointerException: Cannot invoke "net.minecraft.world.entity.Entity.getId()" because "passenger" is null
	at com.example.coolmod.entity.SaddleGoal.tick(SaddleGoal.java:88)
	at net.minecraft.world.entity.ai.goal.GoalSelector.tick(GoalSelector.java:120)`,
        },
        {
          type: "p",
          text: "Sections like `-- Head --` follow, and `-- System Details --` comes last. Those say where and when. The top says why.",
        },
      ],
    },
    {
      id: "description",
      heading: "Start with Description",
      blocks: [
        {
          type: "p",
          text: "Jump to line 5, where it says `Description: Ticking entity` or one of its cousins. That one phrase is what the game was doing when it died. `Ticking entity` means a mob or an item was updating, and `Ticking block entity` is the same for a block like a chest or a furnace. `Exception in server tick loop` means the server's main loop broke, so the real cause is further down, and `Initializing game` means startup, usually a mod that didn't load. None of them names the culprit; they only tell you where to look.",
        },
      ],
    },
    {
      id: "exception",
      heading: "Read the exception, then the last Caused by",
      blocks: [
        {
          type: "p",
          text: "The exception comes right after, with a message, as in `java.lang.NullPointerException: Cannot invoke \"net.minecraft.world.entity.Entity.getId()\" because \"passenger\" is null`. Then look for `Caused by:` lines. If there are several, go straight to the last; the ones above it only show how the error got passed up, and the bottom one is usually the real cause.",
        },
      ],
    },
    {
      id: "whose-code",
      heading: "Work out whose code it is",
      blocks: [
        {
          type: "p",
          text: "Lines starting with `at` are the path the code took, and the front of each name says who owns it:",
        },
        {
          type: "list",
          items: [
            "`net.minecraft` is the game itself.",
            "`net.fabricmc`, `net.minecraftforge` and `net.neoforged` are mod loaders. `org.spongepowered.asm.mixin` is Mixin, which many mods use to change the game.",
            "Anything else usually belongs to a mod, and the middle of the name often shows which one, like `com.example.coolmod`.",
          ],
        },
        {
          type: "p",
          text: "In the example above, `com.example.coolmod.entity.SaddleGoal.tick(SaddleGoal.java:88)` is the first line that isn't `net.minecraft`, so that's the suspect. A suspect, not a verdict; it's where to start looking.",
        },
      ],
    },
    {
      id: "system-details",
      heading: "Keep System Details",
      blocks: [
        {
          type: "p",
          text: "Scroll to `-- System Details --` and leave it in. The Minecraft version, the Java version (say, `21.0.5`), how much memory the game got and, with mods, every mod are in there, and that's the first thing a helper will ask for.",
        },
      ],
    },
    {
      id: "common-causes",
      heading: "Common causes",
      blocks: [
        {
          type: "list",
          items: [
            "A mod made for a different Minecraft version than the one you run.",
            "A mod that's missing a library or another mod it depends on.",
            "Two mods that change the same thing and clash.",
            "`java.lang.OutOfMemoryError`: the game ran out of memory.",
            "`UnsupportedClassVersionError`: the game or a mod wants a newer Java than the one running it.",
          ],
        },
      ],
    },
    {
      id: "get-help",
      heading: "Getting help",
      blocks: [
        {
          type: "p",
          text: "Send the whole report, bottom included; helpers need the parts that aren't at the top. Put it on [minelog](/), share the link, and say what you did just before the crash and whether it began after you added or updated something. Can't find the file? The [guide to finding your logs](/guides/find-minecraft-logs#crash-reports) shows where crash reports live.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "What does Caused by mean in a crash report?",
      answer:
        "The chain of errors behind the crash. Each Caused by line goes one level deeper, and the last is usually the real cause.",
    },
    {
      question: "Do I need to share the whole crash report?",
      answer:
        "Yes. The top says what failed. The Java version and the mod list, which people helping you need, are further down.",
    },
    {
      question: "Can I delete old crash reports?",
      answer:
        "Yes. The game never reads them again, and a new crash makes a new file. Old ones just sit there taking a little space.",
    },
  ],
};
