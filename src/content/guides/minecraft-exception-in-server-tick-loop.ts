import type { Guide } from "./types";

export const SERVER_TICK_LOOP: Guide = {
  slug: "minecraft-exception-in-server-tick-loop",
  path: "/guides/minecraft-exception-in-server-tick-loop",
  title: "What \"Exception in server tick loop\" means",
  metaTitle: "Minecraft \"Exception in server tick loop\" explained",
  description:
    "It's only a label on a server crash report, and the real cause is the exception under it. Find out how to read it and what usually breaks.",
  lead: "The server's main loop threw an error and the server stopped. That phrase is only the wrapper around it, and the actual cause is in the lines underneath.",
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
          text: "A server does its work in ticks, twenty a second. If anything inside a tick throws an exception that nobody catches, the loop dies and the server writes a crash report like the one above before it stops. That's why the description reads exactly the same for very different problems, and why the exception under it is the part to read.",
        },
      ],
    },
    {
      id: "read-it",
      heading: "Reading the cause",
      blocks: [
        {
          type: "p",
          text: "Jump to the last `Caused by:` line, the way [how to read a crash report](/guides/minecraft-crash-report) describes. In the example, `com.example.coolmod` is the first name that isn't `net.minecraft`, so the mod is the suspect.",
        },
      ],
    },
    {
      id: "causes",
      heading: "What usually breaks",
      blocks: [
        {
          type: "p",
          text: "Often it's a mod or plugin throwing an error in its own code, and the package names under `at` show whose it is. Other times it's a damaged chunk in `world/region` or a corrupted player file in `world/playerdata`, or the server simply ran out of memory, in which case you'll see `java.lang.OutOfMemoryError` further down and [the OutOfMemoryError guide](/guides/minecraft-out-of-memory-error) takes over. A mod or plugin made for a different Minecraft version can cause it too.",
        },
      ],
    },
    {
      id: "try",
      heading: "What to try",
      blocks: [
        {
          type: "p",
          text: "Start the server again once, because a crash that doesn't come back was a one-off. If it repeats, read the last `Caused by:` and remove or update the mod or plugin it names. If it dies when one particular player joins, or at one spot in the world, back up the world and then move that player's file out of `world/playerdata`. The name is their UUID with `.dat` on the end, and they'll lose their inventory and position, so keep the copy. For a damaged region file, restore that part of the world from a backup.",
        },
      ],
    },
    {
      id: "hang",
      heading: "When it freezes instead of crashing",
      blocks: [
        {
          type: "p",
          text: "A server that hangs prints `A single server tick took 60.00 seconds (should be max 0.05)` and then `Considering it to be crashed, server will forcibly shutdown.` That's the watchdog on Spigot and Paper doing its job. A tick never finished, which points at the same mod and plugin suspects. For ticks that are merely slow, see [Can't keep up](/guides/minecraft-server-cant-keep-up).",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Sending the log",
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
        "Rarely. The line is only a label, and most of the time a mod, a plugin or damaged world data is behind it.",
    },
    {
      question: "Will I lose my world?",
      answer:
        "Not from this error. Still, back up the world folder before you delete or move anything.",
    },
    {
      question: "Does a restart fix it?",
      answer:
        "Only if the cause was a one-off. A crash that keeps repeating needs its cause fixed.",
    },
  ],
};
