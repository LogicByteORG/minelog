import type { Guide } from "./types";

export const OUT_OF_MEMORY: Guide = {
  slug: "minecraft-out-of-memory-error",
  path: "/guides/minecraft-out-of-memory-error",
  title: "How to fix OutOfMemoryError in Minecraft",
  metaTitle: "Fix Minecraft OutOfMemoryError: Java heap space",
  description:
    "Crashed with java.lang.OutOfMemoryError? Learn what it means and how to give the game or server more memory from your launcher or start command.",
  lead: "Minecraft crashed with an OutOfMemoryError? Don't blame your RAM yet. Java only lets the game use a slice of it, and in most cases the cure is one number in your launcher or start command.",
  updated: "2026-09-26",
  related: ["minecraft-crash-report", "minecraft-could-not-reserve-enough-space", "find-minecraft-logs"],
  sections: [
    {
      id: "what-it-means",
      heading: "What this error is actually telling you",
      blocks: [
        {
          type: "p",
          text: "Java hands Minecraft a fixed pool called the heap, and when the game wants more than fits it just dies with this:",
        },
        {
          type: "code",
          text: `java.lang.OutOfMemoryError: Java heap space`,
        },
        {
          type: "p",
          text: "The default launcher caps that pool at 2 GB, which is the `-Xmx2G` you'll see in a minute. That's plenty for vanilla, but a big modpack or a busy server gets cramped fast.",
        },
        {
          type: "p",
          text: "You'll sometimes see `GC overhead limit exceeded` instead, which is the same problem wearing a different hat, since Java spent nearly all its time cleaning up and freed almost nothing. `unable to create native thread` is another beast entirely. The operating system is refusing it, and throwing more RAM at that tends to make things worse.",
        },
      ],
    },
    {
      id: "launcher",
      heading: "Giving the game more memory",
      blocks: [
        {
          type: "p",
          text: "Most launchers keep a memory setting for each instance. In the Minecraft Launcher you open Installations, hit the three dots on your version, then Edit and More options, and in the JVM arguments box swap `-Xmx2G` for something larger, say `-Xmx4G`. Prism Launcher hides it in the instance settings under Java, as Maximum memory allocation, and with anything else you're looking for Memory, RAM or Java in the settings.",
        },
        {
          type: "p",
          text: "That `G` is gigabytes, so `-Xmx4G` caps the game at 4. Don't hand it everything, because the system needs a few gigs of its own or the whole PC crawls. On a 16 GB machine, 6 to 8 for the game works well.",
        },
      ],
    },
    {
      id: "server",
      heading: "Giving a server more memory",
      blocks: [
        {
          type: "p",
          text: "On a server you change it in the start command by editing the `-Xmx` value and making `-Xms` the same, as in the line below.",
        },
        {
          type: "code",
          text: `java -Xms4G -Xmx4G -jar server.jar nogui`,
        },
        {
          type: "p",
          text: "Hosting panels usually hide all of that behind a RAM slider, which tops out wherever your plan does.",
        },
      ],
    },
    {
      id: "more-isnt-always-better",
      heading: "When more memory doesn't fix it",
      blocks: [
        {
          type: "p",
          text: "If it's still crashing after you raised the number, memory probably isn't the real problem. A huge heap also means longer cleanup sweeps, so you get stutters instead. The usual suspects are a leaking mod or plugin that eats a bit more every minute (if the crash always lands after an hour or two, that's your tell), a big render distance, heavy shaders or a 512x resource pack on the client, and too many loaded chunks or entities on a server. Both the crash report and `latest.log` record what was running when memory ran out, and [the crash report guide](/guides/minecraft-crash-report) shows where to look.",
        },
      ],
    },
    {
      id: "java-crash",
      heading: "When Java says it can't even start",
      blocks: [
        {
          type: "p",
          text: "The message `There is insufficient memory for the Java Runtime Environment to continue` shows up in a file called `hs_err_pid` followed by a number, and it means the machine itself ran dry because Java was promised more than the computer had free. Lower the number or close a few programs.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Sending the log to someone",
      blocks: [
        {
          type: "p",
          text: "When you ask someone for help, send `latest.log` plus the newest crash report. Drop the file on [minelog](/) and you get a link, with IP addresses and similar details hidden first.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "How much RAM does Minecraft actually need?",
      answer:
        "Vanilla gets by on a few gigabytes. Modpacks and busy servers want more, often 4 to 8 GB, and the modpack's own page normally tells you. Just never promise Java more than the computer can spare.",
    },
    {
      question: "What do -Xmx and -Xms mean in the start command?",
      answer:
        "-Xmx is the most memory Java is allowed to take, so -Xmx4G means 4 gigabytes at most, while -Xms is what it grabs right at startup.",
    },
    {
      question: "Why does Minecraft still run out of memory after I gave it more?",
      answer:
        "Most likely something is hoarding it, like a mod or plugin with a leak. If it dies after about the same playing time every run, that's your answer.",
    },
  ],
};
