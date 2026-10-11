import type { Guide } from "./types";

export const OUT_OF_MEMORY: Guide = {
  slug: "minecraft-out-of-memory-error",
  path: "/guides/minecraft-out-of-memory-error",
  title: "How to fix OutOfMemoryError in Minecraft",
  metaTitle: "Fix Minecraft OutOfMemoryError: Java heap space",
  description:
    "Minecraft crashed with java.lang.OutOfMemoryError? See what the message means and how to give the game or server more memory in your launcher or start command.",
  lead: "Java ran out of the memory it was allowed to use, and the fix is usually one number in your launcher or your start command.",
  updated: "2026-09-26",
  related: ["minecraft-crash-report", "minecraft-could-not-reserve-enough-space", "find-minecraft-logs"],
  sections: [
    {
      id: "what-it-means",
      heading: "What the error means",
      blocks: [
        {
          type: "p",
          text: "Java gives Minecraft a fixed pool of memory, the heap, and when the game asks for more than the pool holds it stops with this:",
        },
        {
          type: "code",
          text: `java.lang.OutOfMemoryError: Java heap space`,
        },
        {
          type: "p",
          text: "The pool is smaller than your computer's RAM on purpose. The Minecraft Launcher starts the game with `-Xmx2G`, so 2 GB, which is plenty for vanilla and not enough for a big modpack or a busy server.",
        },
        {
          type: "p",
          text: "Two cousins. `GC overhead limit exceeded` is the same problem: Java spent nearly all its time cleaning up and got almost nothing back. `unable to create native thread` is different. It's a system limit, not the heap, and more memory usually makes it worse.",
        },
      ],
    },
    {
      id: "launcher",
      heading: "Give the game more memory",
      blocks: [
        {
          type: "p",
          text: "Most launchers have a memory setting per instance:",
        },
        {
          type: "list",
          items: [
            "Minecraft Launcher: Installations, the three dots on your version, Edit, More options. In JVM arguments, change `-Xmx2G` to something bigger, like `-Xmx4G`.",
            "Prism Launcher: instance settings, Java, then raise Maximum memory allocation.",
            "Anything else: look for Memory, RAM or Java in the instance or launcher settings.",
          ],
        },
        {
          type: "p",
          text: "`G` is gigabytes, so `-Xmx4G` caps the game at 4 GB. Pick a number the machine can spare. On a 16 GB computer, 6 to 8 GB for the game is a sensible ceiling; leave the rest for the system, or everything slows down.",
        },
      ],
    },
    {
      id: "server",
      heading: "Give a server more memory",
      blocks: [
        {
          type: "p",
          text: "On a server it's the start command. Change the `-Xmx` number, and set `-Xms` to match:",
        },
        {
          type: "code",
          text: `java -Xms4G -Xmx4G -jar server.jar nogui`,
        },
        {
          type: "p",
          text: "On a hosting panel there's usually a RAM slider instead, and your plan sets how far it goes.",
        },
      ],
    },
    {
      id: "more-isnt-always-better",
      heading: "When more memory doesn't help",
      blocks: [
        {
          type: "p",
          text: "Bigger isn't automatically better. Java has to sweep the heap now and then, and a very large one makes those pauses longer, which shows up as lag. If you raised the number and the error came back, it's probably something else:",
        },
        {
          type: "list",
          items: [
            "A mod or plugin that eats more memory the longer the game runs, a leak. A crash that always arrives after an hour or two is the tell.",
            "A high render distance, heavy shaders or a 512x resource pack on the client.",
            "Too many loaded chunks or entities on a server.",
          ],
        },
        {
          type: "p",
          text: "The crash report and `latest.log` show what was running when memory ran out. [How to read a Minecraft crash report](/guides/minecraft-crash-report) shows where to look.",
        },
      ],
    },
    {
      id: "java-crash",
      heading: "If Java says there isn't enough memory to start",
      blocks: [
        {
          type: "p",
          text: "`There is insufficient memory for the Java Runtime Environment to continue`, usually inside a file named `hs_err_pid` plus a number, means the computer itself is out of memory. It's the opposite problem: you asked Java for more than the machine has free. Lower the number or close other programs.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Send the log",
      blocks: [
        {
          type: "p",
          text: "Asking for help? Send `latest.log` and the newest crash report. Drop the file onto [minelog](/) for a link; IP addresses and the like are hidden first.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "How much RAM does Minecraft need?",
      answer:
        "Vanilla is fine on a few gigabytes. Modpacks and busy servers want more, often 4 to 8 GB, and the modpack's page usually says how much. Never hand Java more than the computer can spare.",
    },
    {
      question: "What does -Xmx mean?",
      answer:
        "The largest amount of memory Java may use: -Xmx4G is 4 gigabytes at most. -Xms is how much it grabs at startup.",
    },
    {
      question: "Why does Minecraft still run out of memory after I gave it more?",
      answer:
        "Probably something is holding on to memory, like a mod or plugin with a leak. If it always dies after about the same playing time, that's your answer.",
    },
  ],
};
