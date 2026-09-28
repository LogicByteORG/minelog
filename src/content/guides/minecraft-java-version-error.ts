import type { Guide } from "./types";

export const JAVA_VERSION: Guide = {
  slug: "minecraft-java-version-error",
  path: "/guides/minecraft-java-version-error",
  title: "How to fix UnsupportedClassVersionError in Minecraft",
  metaTitle: "Minecraft UnsupportedClassVersionError: which Java?",
  description:
    "UnsupportedClassVersionError means Minecraft or a mod needs a newer Java than the one running it. See which Java each version needs and how to check yours.",
  lead: "The game, a mod or the server was built for a newer version of Java than the one you're running it with. The fix is to run it with the right Java.",
  updated: "2026-09-26",
  related: ["minecraft-crash-report", "find-minecraft-logs"],
  sections: [
    {
      id: "what-it-means",
      heading: "What the error says",
      blocks: [
        {
          type: "code",
          text: `java.lang.UnsupportedClassVersionError: net/minecraft/server/Main has been compiled by a more recent version of the Java Runtime (class file version 65.0), this version of the Java Runtime only recognizes class file versions up to 61.0`,
        },
        {
          type: "p",
          text: "The two numbers are Java versions in disguise. The first says what the file needs, the second what you have. Subtract 44 from each: 65 is Java 21, and 61 is Java 17. So this file needs Java 21 and is being run with Java 17.",
        },
        {
          type: "table",
          head: ["Class file version", "Java version"],
          rows: [
            ["52.0", "Java 8"],
            ["55.0", "Java 11"],
            ["60.0", "Java 16"],
            ["61.0", "Java 17"],
            ["65.0", "Java 21"],
            ["69.0", "Java 25"],
          ],
        },
      ],
    },
    {
      id: "which-java",
      heading: "Which Java each game version needs",
      blocks: [
        {
          type: "table",
          head: ["Minecraft version", "Java version"],
          rows: [
            ["1.16.5 and older", "Java 8"],
            ["1.17", "Java 16"],
            ["1.18 to 1.20.4", "Java 17"],
            ["1.20.5 to 1.21.x", "Java 21"],
            ["26.1 and newer", "Java 25"],
          ],
        },
        {
          type: "p",
          text: "Each of these means that version or newer. A mod or plugin can ask for a newer Java than the game does, so if the game itself starts and the error names a mod, check what the mod's page says.",
        },
      ],
    },
    {
      id: "check",
      heading: "Check which Java you're running",
      blocks: [
        {
          type: "p",
          text: "Open a terminal and run:",
        },
        {
          type: "code",
          text: `java -version`,
        },
        {
          type: "p",
          text: "The first line says the version, like `openjdk version \"21.0.5\"`. On a computer with several Javas installed, the terminal may pick a different one than the launcher does, so check the one that actually starts the game.",
        },
      ],
    },
    {
      id: "fix-client",
      heading: "Fix it in a launcher",
      blocks: [
        {
          type: "p",
          text: "The Minecraft Launcher brings its own Java, so you rarely see this error there. Other launchers let you pick one. In Prism Launcher, open the instance's settings, go to Java, and choose an installation that matches the table above, or let it download one. If you use a modpack, use the Java version its page asks for.",
        },
      ],
    },
    {
      id: "fix-server",
      heading: "Fix it on a server",
      blocks: [
        {
          type: "steps",
          items: [
            "Install the Java version the table shows for your Minecraft version.",
            "Run `java -version` again and make sure it prints the new one. If it doesn't, start the server with the full path to the new Java, like `/usr/lib/jvm/java-21-openjdk/bin/java -jar server.jar nogui`.",
            "On a hosting panel, look for a Java version setting or startup image and pick the right one.",
          ],
        },
        {
          type: "p",
          text: "The other direction can fail too. Old versions may not run on the newest Java, especially heavy modpacks, so use the version the game asks for, not the biggest number.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Send the log",
      blocks: [
        {
          type: "p",
          text: "If you're not sure which file is the problem, send `latest.log`. Drop it onto [minelog](/) for a link. The Analyze menu on a saved log shows the Java version the log itself reports.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "What does class file version 65.0 mean?",
      answer:
        "The file was built for Java 21. Subtract 44 from the class file version to get the Java version.",
    },
    {
      question: "Which Java does Minecraft 1.21 need?",
      answer:
        "Java 21 or newer. Minecraft 1.20.5 and later need Java 21, and 26.1 and later need Java 25.",
    },
    {
      question: "Can I keep several Java versions installed?",
      answer:
        "Yes. Most launchers let each instance pick its own. For a server, start it with the full path to the Java you want.",
    },
  ],
};
