import type { Guide } from "./types";

export const OUT_OF_MEMORY: Guide = {
  slug: "minecraft-out-of-memory-error",
  path: "/guides/minecraft-out-of-memory-error",
  title: "How to fix OutOfMemoryError in Minecraft",
  metaTitle: "Fix Minecraft OutOfMemoryError: Java heap space",
  description:
    "Minecraft crashed with java.lang.OutOfMemoryError? See what the message means and how to give the game or server more memory in your launcher or start command.",
  lead: "OutOfMemoryError means Java ran out of the memory it was allowed to use. Most of the time the fix is a number in your launcher or your start command.",
  updated: "2026-09-26",
  related: ["minecraft-crash-report", "find-minecraft-logs"],
  sections: [
    {
      id: "what-it-means",
      heading: "What the error means",
      blocks: [
        {
          type: "p",
          text: "Java runs Minecraft inside a box of memory, called the heap, and the box has a fixed size. When the game needs more than fits, it stops with an error like this:",
        },
        {
          type: "code",
          text: `java.lang.OutOfMemoryError: Java heap space`,
        },
        {
          type: "p",
          text: "The box is smaller than the computer's memory on purpose. The default is often only 2 GB, which is enough for the plain game and not enough for a big modpack or a busy server.",
        },
        {
          type: "p",
          text: "Two related messages: `GC overhead limit exceeded` means the same thing, Java spent nearly all its time trying to free memory and got almost nothing back. `unable to create native thread` is a different problem. It's a limit set by the system, not the heap, and giving Java more memory usually makes it worse.",
        },
      ],
    },
    {
      id: "launcher",
      heading: "Give the game more memory",
      blocks: [
        {
          type: "p",
          text: "Most launchers have a memory setting for each instance:",
        },
        {
          type: "list",
          items: [
            "Minecraft Launcher: go to Installations, open the three dots on your version, choose Edit, then More options. In JVM arguments, change `-Xmx2G` to a bigger number, like `-Xmx4G`.",
            "Prism Launcher: open the instance's settings, go to Java, and raise Maximum memory allocation.",
            "Other launchers: look for a Memory, RAM or Java setting in the instance or in the launcher's settings.",
          ],
        },
        {
          type: "p",
          text: "`G` is gigabytes, so `-Xmx4G` lets the game use up to 4 GB. Pick a number your computer can spare. Leave at least a few GB for the system and everything else that's open, or the whole computer slows down.",
        },
      ],
    },
    {
      id: "server",
      heading: "Give a server more memory",
      blocks: [
        {
          type: "p",
          text: "On a server, memory is set in the command that starts it. Change the `-Xmx` number, and set `-Xms` to the same value:",
        },
        {
          type: "code",
          text: `java -Xms4G -Xmx4G -jar server.jar nogui`,
        },
        {
          type: "p",
          text: "On a hosting panel there's usually a memory or RAM setting instead, and the plan decides how high it can go.",
        },
      ],
    },
    {
      id: "more-isnt-always-better",
      heading: "When more memory doesn't help",
      blocks: [
        {
          type: "p",
          text: "A bigger heap isn't automatically better. Java has to clean it up from time to time, and a very large heap can make those pauses longer and show up as lag. If you raised the number and the error came back, the cause is probably something else:",
        },
        {
          type: "list",
          items: [
            "A mod or plugin that keeps using more memory the longer the game runs, a memory leak. If the crash always comes after an hour or two, that's the sign.",
            "A high render distance, big shaders or huge resource packs on the client.",
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
          text: "A message like `There is insufficient memory for the Java Runtime Environment to continue`, usually in a file called `hs_err_pid` plus a number, means the computer itself is out of memory. That's the opposite problem: you asked Java for more than the machine has free. Lower the number or close other programs.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Send the log",
      blocks: [
        {
          type: "p",
          text: "If you're asking someone for help, send `latest.log` and the newest crash report. Drop the file onto [minelog](/) to get a link. Private details like IP addresses are hidden first.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "How much RAM does Minecraft need?",
      answer:
        "The plain game runs on a few gigabytes. Modpacks and servers with many players need more, often 4 to 8 GB, and the modpack's page usually says how much. Don't give Java more than your computer can spare.",
    },
    {
      question: "What does -Xmx mean?",
      answer:
        "It sets the largest amount of memory Java may use. -Xmx4G means up to 4 gigabytes. -Xms sets how much it takes at the start.",
    },
    {
      question: "Why does Minecraft still run out of memory after I gave it more?",
      answer:
        "Something is probably using memory without letting it go, like a mod or plugin with a leak. If it always crashes after the same amount of playing time, that's the likely cause.",
    },
  ],
};
