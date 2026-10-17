import type { Guide } from "./types";

export const JAVA_VERSION: Guide = {
  slug: "minecraft-java-version-error",
  path: "/guides/minecraft-java-version-error",
  title: "How to fix UnsupportedClassVersionError in Minecraft",
  metaTitle: "Minecraft UnsupportedClassVersionError: which Java?",
  description:
    "Minecraft or a mod wants a newer Java than the one running it. See which Java each version needs and how to check yours.",
  lead: "Whatever you're launching, be it the game, a mod or a server jar, was compiled for a newer Java than the one that's actually running it. Point it at the right Java and the crash goes away.",
  updated: "2026-09-26",
  related: ["minecraft-crash-report", "find-minecraft-logs"],
  sections: [
    {
      id: "what-it-means",
      heading: "Reading the error",
      blocks: [
        {
          type: "code",
          text: `java.lang.UnsupportedClassVersionError: net/minecraft/server/Main has been compiled by a more recent version of the Java Runtime (class file version 65.0), this version of the Java Runtime only recognizes class file versions up to 61.0`,
        },
        {
          type: "p",
          text: "The message is clumsy, but the two numbers in it are the useful part. They're class file versions, each one sitting 44 above the Java release it belongs to, which makes 65 Java 21 and 61 Java 17. In this example, then, a file that needs 21 got launched on 17. The table below has the other versions you'll bump into.",
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
      heading: "Matching Java to Minecraft",
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
          text: "Have a look at the table above before you install anything, because it saves a lot of guessing. Each row means that version or newer, so going higher is normally fine. Mods are where it gets messy: a mod or plugin may demand a newer Java than the game does, and when the game boots but the error mentions a mod, the mod's own page wins over this table.",
        },
      ],
    },
    {
      id: "check",
      heading: "Finding out which Java you have",
      blocks: [
        {
          type: "p",
          text: "Type this into a terminal and read the first line, which will look like `openjdk version \"21.0.5\"`:",
        },
        {
          type: "code",
          text: `java -version`,
        },
        {
          type: "p",
          text: "If you've collected a few Javas over the years, the terminal can grab a different one than your launcher does, and the launcher's is the one that matters, so don't trust the terminal blindly.",
        },
      ],
    },
    {
      id: "fix-client",
      heading: "Launchers",
      blocks: [
        {
          type: "p",
          text: "Mojang's own launcher bundles a Java for you, which is why you rarely see this error from it. Other launchers usually leave the choice to you. In Prism Launcher you open the instance's settings, go to Java, and pick an install that fits the table, or let Prism fetch one for you. Playing a modpack? Go by whatever Java the pack's page recommends.",
        },
      ],
    },
    {
      id: "fix-server",
      heading: "Servers",
      blocks: [
        {
          type: "p",
          text: "Install the Java that matches your Minecraft version and run `java -version` once more to see whether it really changed. If it keeps printing the old one, launch the server with the full path to the new Java instead, something like `/usr/lib/jvm/java-21-openjdk/bin/java -jar server.jar nogui`. A hosting panel will normally have a dropdown for this somewhere in the startup settings. Newest isn't always best, though, since old versions and big modpacks sometimes choke on it, so go with whatever the game asks for.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Sending the log",
      blocks: [
        {
          type: "p",
          text: "Not sure which file to hand over? `latest.log` is a safe bet. Drop it onto [minelog](/) and you'll get a link, and after it's saved the Analyze menu shows the Java version the log reports about itself.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "What does class file version 65.0 mean?",
      answer:
        "It means Java 21. Take 44 off the class file version and you've got the Java release.",
    },
    {
      question: "Which Java does Minecraft 1.21 need?",
      answer:
        "Java 21 or newer, same as everything from 1.20.5 on. Versions 26.1 and later need Java 25.",
    },
    {
      question: "Can I have more than one Java installed?",
      answer:
        "You can, and plenty of people do. Most launchers let each instance pick its own, and for a server you just start it with the full path to the Java you want.",
    },
  ],
};
