import type { Guide } from "./types";

export const COULD_NOT_RESERVE: Guide = {
  slug: "minecraft-could-not-reserve-enough-space",
  path: "/guides/minecraft-could-not-reserve-enough-space",
  title: "How to fix \"Could not reserve enough space for object heap\"",
  metaTitle: "Fix \"Could not reserve enough space\" in Minecraft",
  description:
    "Java refused to start because the memory it was asked for wasn't there. Too much RAM, a 32-bit Java or an -Xms bigger than -Xmx are the usual causes.",
  lead: "Java never even started. You asked it for more memory than it could set aside, so it gave up before Minecraft got a chance to load.",
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
          text: "That number in the message is how much memory Java was asked for, and 4194304 KB works out to 4 GB. It's easy to mix this up with `OutOfMemoryError`, but that one only hits after the game is already running, whereas here nothing ran at all. Don't be thrown if the wording differs. `Invalid maximum heap size: -Xmx...`, `Invalid initial heap size` and `Initial heap size set to a larger value than the maximum heap size` are all cousins of the same problem.",
        },
      ],
    },
    {
      id: "ask-for-less",
      heading: "Fix 1: ask for less",
      blocks: [
        {
          type: "p",
          text: "Most of the time the computer simply didn't have that much free, so bring the number down. In a launcher that's the memory slider, or the `-Xmx` bit of the JVM arguments, and in a start command you'd change `-Xmx8G` to `-Xmx4G`. A tip for Linux: the free column of `free -h` is misleading, since the system parks spare RAM as file cache, so go by the `available` column instead.",
        },
      ],
    },
    {
      id: "64-bit",
      heading: "Fix 2: switch to a 64-bit Java",
      blocks: [
        {
          type: "p",
          text: "A 32-bit Java tops out around 1.5 GB, which means a bigger `-Xmx` fails no matter how much RAM the machine has. Type `java -version` and look at the last line. A 64-bit build says `64-Bit Server VM` there, and if yours doesn't, install a 64-bit Java and pick it in your launcher. [The Java version guide](/guides/minecraft-java-version-error) has the details on which one to get.",
        },
      ],
    },
    {
      id: "xms",
      heading: "Fix 3: look at -Xms",
      blocks: [
        {
          type: "p",
          text: "`-Xms` is the starting size, and it isn't allowed to be bigger than `-Xmx`, the maximum. So `-Xms8G -Xmx4G` fails with that `Initial heap size` message, and the usual fix is keeping the two equal, as in the line below.",
        },
        {
          type: "code",
          text: `java -Xms4G -Xmx4G -jar server.jar nogui`,
        },
        {
          type: "p",
          text: "Hosting panels add a twist, since your plan caps the RAM setting and going over it can trigger this very error. Lower it, or ask support what your plan allows.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Sending the log",
      blocks: [
        {
          type: "p",
          text: "Still stuck? Send the start command along with the first lines of the console or `latest.log`, and put them on [minelog](/) for a link.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "What's the difference from OutOfMemoryError?",
      answer:
        "This one stops Java before the game starts, because the memory can't be set aside. OutOfMemoryError comes later, once the game has already used up what it was given.",
    },
    {
      question: "Why does -Xmx2G work but -Xmx8G doesn't?",
      answer:
        "Either 8 GB isn't free on that machine or the Java is 32-bit. Raise the number step by step until it stops starting, or close other programs first.",
    },
    {
      question: "How much memory should I give it?",
      answer:
        "Vanilla is happy with a few gigabytes, while modpacks and busy servers often want 4 to 8 GB. Whatever you pick, leave the computer enough to breathe.",
    },
  ],
};
