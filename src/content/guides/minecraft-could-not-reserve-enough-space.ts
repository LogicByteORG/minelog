import type { Guide } from "./types";

export const COULD_NOT_RESERVE: Guide = {
  slug: "minecraft-could-not-reserve-enough-space",
  path: "/guides/minecraft-could-not-reserve-enough-space",
  title: "How to fix \"Could not reserve enough space for object heap\"",
  metaTitle: "Fix \"Could not reserve enough space\" in Minecraft",
  description:
    "Java refused to start because the memory it was asked for wasn't available. The usual causes are too much RAM, a 32-bit Java and an -Xms bigger than -Xmx.",
  lead: "Java never started. It was asked for more memory than it could set aside, so it quit before Minecraft loaded.",
  updated: "2026-10-11",
  related: ["minecraft-out-of-memory-error", "minecraft-java-version-error", "find-minecraft-logs"],
  sections: [
    {
      id: "what-it-looks-like",
      heading: "What the error looks like",
      blocks: [
        {
          type: "code",
          text: `Error occurred during initialization of VM
Could not reserve enough space for 4194304KB object heap`,
        },
        {
          type: "p",
          text: "The number is the memory Java was asked for, and 4194304 KB is 4 GB. This is not `OutOfMemoryError`, which hits after the game is already running. Here nothing ran at all. You may also see `Invalid maximum heap size: -Xmx...`, `Invalid initial heap size` or `Initial heap size set to a larger value than the maximum heap size`. Same family.",
        },
      ],
    },
    {
      id: "ask-for-less",
      heading: "Fix 1: ask for less",
      blocks: [
        {
          type: "p",
          text: "The computer didn't have that much free. Lower the number: in a launcher it's the memory slider or `-Xmx` in the JVM arguments, and in a start command you change `-Xmx8G` to `-Xmx4G`. On Linux, don't judge by the free column of `free -h`, because the system keeps spare RAM as file cache. Read the `available` column instead.",
        },
      ],
    },
    {
      id: "64-bit",
      heading: "Fix 2: use a 64-bit Java",
      blocks: [
        {
          type: "p",
          text: "A 32-bit Java can't hold more than about 1.5 GB, so a larger `-Xmx` fails even on a machine with plenty of RAM. Run `java -version`. A 64-bit build prints `64-Bit Server VM` on the last line. If yours doesn't, install a 64-bit Java and pick it in your launcher. [The Java version guide](/guides/minecraft-java-version-error) covers which one to get.",
        },
      ],
    },
    {
      id: "xms",
      heading: "Fix 3: check -Xms",
      blocks: [
        {
          type: "p",
          text: "`-Xms` is the starting size and it can't be bigger than `-Xmx`, the maximum. `-Xms8G -Xmx4G` fails with `Initial heap size set to a larger value than the maximum heap size`. The usual setup keeps them equal:",
        },
        {
          type: "code",
          text: `java -Xms4G -Xmx4G -jar server.jar nogui`,
        },
        {
          type: "p",
          text: "On a hosting panel the RAM setting is capped by your plan, and setting it above what the plan includes can trigger this error. Lower it, or ask support.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Send the log",
      blocks: [
        {
          type: "p",
          text: "Still stuck? Send the start command and the first lines of the console or `latest.log`. Put them on [minelog](/) for a link.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "What's the difference from OutOfMemoryError?",
      answer:
        "This error stops Java before the game starts, because the memory can't be set aside. OutOfMemoryError happens after it started, when the game used up what it was given.",
    },
    {
      question: "Why does -Xmx2G work but -Xmx8G doesn't?",
      answer:
        "Because 8 GB isn't free on that machine, or the Java is 32-bit. Raise the number step by step until it stops starting, or close other programs first.",
    },
    {
      question: "How much memory should I give it?",
      answer:
        "Vanilla is fine on a few gigabytes. Modpacks and busy servers often want 4 to 8 GB. Never ask for more than the computer can spare.",
    },
  ],
};
