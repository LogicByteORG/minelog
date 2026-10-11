import type { Guide } from "./types";

export const SERVER_TICK_LOOP: Guide = {
  slug: "minecraft-exception-in-server-tick-loop",
  path: "/guides/minecraft-exception-in-server-tick-loop",
  title: "What \"Exception in server tick loop\" means",
  metaTitle: "Minecraft \"Exception in server tick loop\" explained",
  description:
    "Exception in server tick loop is only a label on a server crash report. The real cause is the exception under it. Learn how to read it and what usually breaks.",
  lead: "The server's main loop threw an error and the server stopped. The phrase is only the wrapper. The cause is in the lines under it.",
  updated: "2026-10-11",
  related: ["minecraft-crash-report", "minecraft-server-cant-keep-up", "minecraft-out-of-memory-error", "share-a-log-file-safely"],
  sections: [
    {
      id: "what-it-means",
      heading: "What it means",
      blocks: [
        {
          type: "code",
          caption: "An invented example, not a real mod",
          text: `---- Minecraft Crash Report ----
Time: 2026-10-11 20:49:02
Description: Exception in server tick loop

java.lang.NullPointerException: Cannot invoke "net.minecraft.world.entity.Entity.getId()" because "passenger" is null
	at com.example.coolmod.entity.SaddleGoal.tick(SaddleGoal.java:88)`,
        },
        {
          type: "p",
          text: "A server does its work in ticks, twenty a second. If anything inside a tick throws an exception that nobody catches, the loop dies, the server writes a crash report like this one and stops. So the description reads the same for very different problems. The exception under it says which.",
        },
      ],
    },
    {
      id: "read-it",
      heading: "Read the cause",
      blocks: [
        {
          type: "p",
          text: "Jump to the last `Caused by:` line, as in [how to read a crash report](/guides/minecraft-crash-report). In the example, `com.example.coolmod` is the first name that isn't `net.minecraft`, so the mod is the suspect.",
        },
      ],
    },
    {
      id: "causes",
      heading: "What usually breaks",
      blocks: [
        {
          type: "list",
          items: [
            "A mod or plugin throwing an error in its own code. The package names under `at` show whose it is.",
            "A damaged chunk in `world/region`, or a corrupted player file in `world/playerdata`.",
            "Running out of memory: look for `java.lang.OutOfMemoryError` further down, then see [the OutOfMemoryError guide](/guides/minecraft-out-of-memory-error).",
            "A mod or plugin made for a different Minecraft version.",
          ],
        },
      ],
    },
    {
      id: "try",
      heading: "What to try",
      blocks: [
        {
          type: "steps",
          items: [
            "Start the server again once. A crash that doesn't come back was a one-off.",
            "If it repeats, read the last `Caused by:` and remove or update the mod or plugin it names.",
            "If it dies when one player joins, or at one spot, back up the world, then move that player's file out of `world/playerdata`. The name is their UUID with `.dat` on the end. They lose their inventory and position, so keep the copy.",
            "For a damaged region file, restore that part of the world from a backup.",
          ],
        },
      ],
    },
    {
      id: "hang",
      heading: "When it freezes instead of crashing",
      blocks: [
        {
          type: "p",
          text: "A server that hangs prints `A single server tick took 60.00 seconds (should be max 0.05)` and then `Considering it to be crashed, server will forcibly shutdown.` That's the watchdog on Spigot and Paper. A tick never finished, which points at the same mod or plugin suspects. For ticks that are only slow, see [Can't keep up](/guides/minecraft-server-cant-keep-up).",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Send the log",
      blocks: [
        {
          type: "p",
          text: "If you're asking for help, send the crash report and `latest.log`. Drop them onto [minelog](/) for a link with IP addresses hidden.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Is it a bug in Minecraft itself?",
      answer:
        "Rarely. The line is a label. Most of the time a mod, a plugin or damaged world data is behind it.",
    },
    {
      question: "Will I lose my world?",
      answer:
        "Not from this error. Back up the world folder before you delete or move anything, though.",
    },
    {
      question: "Does a restart fix it?",
      answer:
        "Only if the cause was a one-off. A crash that repeats needs its cause fixed.",
    },
  ],
};
