import type { Guide } from "./types";

export const CRASH_REPORT: Guide = {
  slug: "minecraft-crash-report",
  path: "/guides/minecraft-crash-report",
  title: "How to read a Minecraft crash report",
  metaTitle: "How to read a Minecraft crash report",
  description:
    "It looks like a wall of text, but the answer usually sits in three places: the Description line, the stack trace and the Caused by lines.",
  lead: "A crash report looks like a wall of text, but you can skip most of it. The answer is usually hiding in a few lines close to the top.",
  updated: "2026-09-26",
  related: ["find-minecraft-logs", "minecraft-exception-in-server-tick-loop", "minecraft-mixin-apply-failed", "minecraft-out-of-memory-error"],
  sections: [
    {
      id: "whats-in-it",
      heading: "What's actually in the file",
      blocks: [
        {
          type: "p",
          text: "Open `crash-2026-09-20_20.49.02-client.txt`, or whichever file is newest, and you'll see the same layout every time: a `---- Minecraft Crash Report ----` banner, a joke comment, a `Time:` line, a `Description:` line and then the error itself. Here's an invented one, so don't go hunting for that mod:",
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
          text: "After it come sections like `-- Head --`, with `-- System Details --` last. Those tell you where and when, while the top tells you why.",
        },
      ],
    },
    {
      id: "description",
      heading: "Start with the Description line",
      blocks: [
        {
          type: "p",
          text: "Jump to line 5, where it says `Description: Ticking entity` or one of its cousins. That one phrase is what the game was busy doing when it died. `Ticking entity` means a mob or an item was updating, and `Ticking block entity` is the same thing for a block like a chest or a furnace. `Exception in server tick loop` means the server's main loop broke, so the real cause sits further down, and `Initializing game` means startup, usually a mod that didn't load. None of them names the culprit, they just tell you where to look.",
        },
      ],
    },
    {
      id: "exception",
      heading: "The exception and the last Caused by",
      blocks: [
        {
          type: "p",
          text: "The exception comes right after, with a message, like the `NullPointerException` about a null `passenger` in the example. Below it you'll find `Caused by:` lines. If there are several, go straight to the last one, since the ones above it only show how the error got passed up and the bottom one is usually the real cause.",
        },
      ],
    },
    {
      id: "whose-code",
      heading: "Whose code is it?",
      blocks: [
        {
          type: "p",
          text: "Lines starting with `at` are the path the code took, and the front of each name says who owns it. Anything starting with `net.minecraft` is the game itself, while `net.fabricmc`, `net.minecraftforge` and `net.neoforged` are mod loaders, and `org.spongepowered.asm.mixin` is Mixin, which many mods use to change the game. Everything else usually belongs to a mod, and the middle of the name often shows which one, like `com.example.coolmod`. In the example, the `SaddleGoal` line is the first one that isn't `net.minecraft`, so that's the suspect. It's a suspect, not a verdict, but it's a good place to start.",
        },
      ],
    },
    {
      id: "system-details",
      heading: "Leave System Details alone",
      blocks: [
        {
          type: "p",
          text: "Scroll down to `-- System Details --` and leave it in. The Minecraft version, the Java version (say, `21.0.5`), how much memory the game got and, with mods, every mod are in there, and it's the first thing a helper is going to ask you for.",
        },
      ],
    },
    {
      id: "common-causes",
      heading: "Why these things usually crash",
      blocks: [
        {
          type: "p",
          text: "Most crashes fall into a handful of buckets. You might have a mod built for a different Minecraft version than the one you run, or one that's missing a library or another mod it depends on. Two mods can also change the same thing and fight over it. Then there's `java.lang.OutOfMemoryError`, which means the game ran out of memory, and `UnsupportedClassVersionError`, which means the game or a mod wants a newer Java than the one running it.",
        },
      ],
    },
    {
      id: "get-help",
      heading: "Asking for help",
      blocks: [
        {
          type: "p",
          text: "Send the whole report, bottom included. The parts helpers need most aren't at the top. Put it on [minelog](/) and share the link, and tell them what you did right before the crash, and whether it started after you added or updated something. If you can't find the file, [the guide to finding your logs](/guides/find-minecraft-logs#crash-reports) shows where crash reports live.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "What does Caused by mean in a crash report?",
      answer:
        "It's the chain of errors behind the crash. Each Caused by line goes one level deeper, and the last one is usually the real cause.",
    },
    {
      question: "Do I need to share the whole crash report?",
      answer:
        "Yes, all of it. The top says what failed, but the Java version and the mod list, which the people helping you need, are further down.",
    },
    {
      question: "Can I delete old crash reports?",
      answer:
        "Sure. The game never reads them again and a new crash makes a new file, so the old ones just sit there taking a little space.",
    },
  ],
};
