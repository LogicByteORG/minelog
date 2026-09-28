import type { Guide } from "./types";

export const CRASH_REPORT: Guide = {
  slug: "minecraft-crash-report",
  path: "/guides/minecraft-crash-report",
  title: "How to read a Minecraft crash report",
  metaTitle: "How to read a Minecraft crash report",
  description:
    "A crash report looks like a wall of text, but the answer is usually in three places. Learn what Description, the stack trace and Caused by lines mean.",
  lead: "A crash report looks like a wall of text, but you only need a few lines of it, and they're near the top.",
  updated: "2026-09-26",
  related: ["find-minecraft-logs", "minecraft-out-of-memory-error", "minecraft-java-version-error", "share-a-log-file-safely"],
  sections: [
    {
      id: "whats-in-it",
      heading: "What's in a crash report",
      blocks: [
        {
          type: "p",
          text: "Every report starts the same way: a header, a joke comment, the time, a description, and then the error itself. This is an invented example:",
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
          text: "After that come detail sections like `-- Head --`, and `-- System Details --` at the very end. The details say where and when it happened. The top says why.",
        },
      ],
    },
    {
      id: "description",
      heading: "Start with Description",
      blocks: [
        {
          type: "p",
          text: "`Description:` says what the game was doing when it failed. Common ones are `Ticking entity`, `Ticking block entity`, `Exception in server tick loop` and `Initializing game`. It doesn't name the culprit, but it narrows the search. Ticking an entity points at a mob or an item. Initializing the game points at startup, usually a mod that didn't load.",
        },
      ],
    },
    {
      id: "exception",
      heading: "Read the exception, then the last Caused by",
      blocks: [
        {
          type: "p",
          text: "The line under Description names the exception, like `NullPointerException`, with a message. If there are lines starting with `Caused by:` below it, read the last one first. The ones above it only describe how the error travelled. The last one is usually the real cause.",
        },
      ],
    },
    {
      id: "whose-code",
      heading: "Work out whose code it is",
      blocks: [
        {
          type: "p",
          text: "The lines that start with `at` are the path the code took. The start of each name shows who owns it:",
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
          text: "The first line that isn't `net.minecraft` is a good suspect. Only a suspect: it's where to start looking, not a verdict.",
        },
      ],
    },
    {
      id: "system-details",
      heading: "Keep System Details",
      blocks: [
        {
          type: "p",
          text: "Scroll down to `-- System Details --`. It lists the Minecraft version, the Java version, how much memory the game had and, if you use mods, every mod. Whoever is helping will ask for it, so leave it in.",
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
            "`UnsupportedClassVersionError`: something needs a newer Java than the one you're using.",
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
          text: "Send the whole report, all the way to the bottom. Helpers look for details that aren't at the top. Put it on [minelog](/) and share the link, and say what you did right before the crash and whether it started after you added or updated something. If you can't find the file, the [guide to finding your logs](/guides/find-minecraft-logs#crash-reports) shows where crash reports are.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "What does Caused by mean in a crash report?",
      answer:
        "It shows the chain of errors that led to the crash. Each Caused by line goes one step deeper, and the last one is usually the real cause.",
    },
    {
      question: "Do I need to share the whole crash report?",
      answer:
        "Yes. The top shows what failed, but people helping you also need the details further down, like the Java version and the mod list.",
    },
    {
      question: "Can I delete old crash reports?",
      answer:
        "Yes. The game only reads them when you open them yourself. Old ones just take up a little space, and new crashes create new files.",
    },
  ],
};
