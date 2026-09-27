import type { Guide } from "./guides";

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

export const CANT_KEEP_UP: Guide = {
  slug: "minecraft-server-cant-keep-up",
  path: "/guides/minecraft-server-cant-keep-up",
  title: "What \"Can't keep up! Is the server overloaded?\" means",
  metaTitle: "Minecraft \"Can't keep up\" warning: causes and fixes",
  description:
    "The server logs Can't keep up! Is the server overloaded? when a tick takes too long. Learn what it means, when to ignore it and how to find what causes the lag.",
  lead: "This warning means the server fell behind. It's a lag message, not a crash, and one line of it isn't a problem.",
  updated: "2026-09-26",
  related: ["find-minecraft-logs", "share-a-log-file-safely"],
  sections: [
    {
      id: "what-it-means",
      heading: "What the warning means",
      blocks: [
        {
          type: "p",
          text: "A Minecraft server does its work in ticks, twenty every second, so each tick has 50 milliseconds. When one takes longer, the server is late and writes this to the log:",
        },
        {
          type: "code",
          text: `[Server thread/WARN]: Can't keep up! Is the server overloaded? Running 2345ms or 46 ticks behind`,
        },
        {
          type: "p",
          text: "The numbers say how far behind it got. While it's late, everything slows down for every player at once: blocks break late, mobs stutter and players get pulled back.",
        },
        {
          type: "p",
          text: "You may also see `Did the system time change, or is the server overloaded?`. It's the same warning, worded for when the clock jumped, which can happen when a computer wakes from sleep.",
        },
      ],
    },
    {
      id: "when-to-ignore",
      heading: "When you can ignore it",
      blocks: [
        {
          type: "p",
          text: "One or two lines while the server starts, while a world loads, or when a lot of new land is being generated aren't worth chasing. It's a problem when the warning keeps repeating during normal play, or when players complain about lag.",
        },
      ],
    },
    {
      id: "causes",
      heading: "What usually causes it",
      blocks: [
        {
          type: "list",
          items: [
            "Generating new chunks, for example when several players fly or explore into new land at once.",
            "Too many entities: big mob farms, piles of dropped items, animals crowded into one pen.",
            "Large redstone machines and long hopper chains.",
            "A slow processor. A Minecraft server does most of its work on one thread, so a fast single core matters more than many slow ones.",
            "A plugin or mod that does heavy work on the main thread.",
            "Long memory clean-up pauses, when the server has too little memory or far too much. See [OutOfMemoryError](/guides/minecraft-out-of-memory-error).",
          ],
        },
      ],
    },
    {
      id: "find-it",
      heading: "Find what is causing it",
      blocks: [
        {
          type: "p",
          text: "Guessing wastes time, so measure. The spark plugin and mod can profile a running server. Its `/spark profiler` command records for a while, then gives you a page that shows which plugin, mod or activity used the most tick time. On Paper and its forks, `/tps` shows the current ticks per second. A healthy server stays at 20.",
        },
      ],
    },
    {
      id: "fixes",
      heading: "Ways to fix it",
      blocks: [
        {
          type: "steps",
          items: [
            "Lower `view-distance` and `simulation-distance` in `server.properties`. They're the quickest way to cut the work per tick.",
            "Generate the world in advance with a tool like Chunky, so nobody triggers it during play.",
            "Reduce entities: smaller farms, fewer animals per pen, and remove item piles.",
            "Remove plugins and mods you don't use, and update the ones you do.",
            "Check the memory setting, and move to a host with a faster processor if the profiler shows the server is simply too busy.",
          ],
        },
      ],
    },
    {
      id: "share-it",
      heading: "Send the log",
      blocks: [
        {
          type: "p",
          text: "If you're asking for help, send `latest.log` from a session where the warning repeats. Drop it onto [minelog](/) to get a link with IP addresses hidden. [Where to find your log](/guides/find-minecraft-logs) has the paths.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Is \"Can't keep up\" a crash?",
      answer:
        "No. The server keeps running, it's only running behind. It becomes a problem when it repeats and players notice lag.",
    },
    {
      question: "How many ticks per second should a server have?",
      answer:
        "Twenty. Each tick then takes 50 milliseconds. Below 20 the game slows down.",
    },
    {
      question: "Will more RAM stop the warning?",
      answer:
        "Only if the server was short of memory. Most of the time the limit is processor speed or a heavy farm, plugin or mod, so measure with a profiler before buying more.",
    },
  ],
};

export const FAILED_TO_BIND: Guide = {
  slug: "minecraft-failed-to-bind-to-port",
  path: "/guides/minecraft-failed-to-bind-to-port",
  title: "How to fix \"Failed to bind to port\" on a Minecraft server",
  metaTitle: "Fix Minecraft \"Failed to bind to port\" error",
  description:
    "A Minecraft server that says FAILED TO BIND TO PORT can't use its port. The usual causes are another program on the port or a wrong server-ip. Here is the fix.",
  lead: "The server tried to use a port and couldn't. The cause is almost always on the same computer, not your router or your internet.",
  updated: "2026-09-26",
  related: ["find-minecraft-logs", "share-a-log-file-safely"],
  sections: [
    {
      id: "what-it-means",
      heading: "What the error looks like",
      blocks: [
        {
          type: "code",
          text: `**** FAILED TO BIND TO PORT!
The exception was: java.net.BindException: Address already in use
Perhaps a server is already running on that port?`,
        },
        {
          type: "p",
          text: "A server listens on a port, 25565 unless you changed it. Only one program can listen on a port at a time. The error means the server asked for it and the computer said no. The exact wording after `BindException` changes with the system, and Windows adds `: bind` at the end.",
        },
      ],
    },
    {
      id: "already-running",
      heading: "Another server is already running",
      blocks: [
        {
          type: "p",
          text: "The usual cause is a server you started earlier that never closed, or a second copy of the same one. Find what's using the port and stop it:",
        },
        {
          type: "list",
          items: [
            "Windows: run `netstat -ano | findstr :25565` in a terminal. The last number is the process ID. Find it in Task Manager under Details and end that Java process.",
            "Linux and macOS: run `lsof -i :25565`, or `ss -ltnp | grep 25565` on Linux, then stop the process it lists.",
          ],
        },
        {
          type: "p",
          text: "If nothing is listed and you don't see a Java process, restart the computer once. It clears a port that a crashed program left open.",
        },
      ],
    },
    {
      id: "server-ip",
      heading: "server-ip is filled in",
      blocks: [
        {
          type: "p",
          text: "Open `server.properties` and look at the `server-ip` line. It should be empty:",
        },
        {
          type: "code",
          text: `server-ip=`,
        },
        {
          type: "p",
          text: "If it holds an address that doesn't belong to this computer, for example your public address, the server can't bind to it. Empty means it listens on all of them.",
        },
      ],
    },
    {
      id: "other-port",
      heading: "Use a different port",
      blocks: [
        {
          type: "p",
          text: "If something else needs 25565, change `server-port` in `server.properties` to another number, like 25566, and restart. Players then join with the port added to the address, like `example.com:25566`. On a hosting panel the port is assigned to you, so leave it and contact support if it fails.",
        },
      ],
    },
    {
      id: "not-the-router",
      heading: "It isn't your router",
      blocks: [
        {
          type: "p",
          text: "Port forwarding and firewalls decide whether other people can reach your server. They don't cause this error, which happens before anyone connects. Fix the local cause first, then look at forwarding if friends still can't join.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Send the log",
      blocks: [
        {
          type: "p",
          text: "If it still fails, send `latest.log` and your `server.properties`. Drop them onto [minelog](/) for a link. IP addresses are hidden before upload.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "What port does a Minecraft server use?",
      answer:
        "25565 by default. You can change it with server-port in server.properties.",
    },
    {
      question: "Do I need to forward a port to fix this error?",
      answer:
        "No. This error is about the computer the server runs on. Forwarding only decides whether people outside your network can join.",
    },
    {
      question: "Why does it say Address already in use when nothing else is running?",
      answer:
        "A crashed server or another Java process may still hold the port. Check with netstat or lsof, or restart the computer.",
    },
  ],
};

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

export const ERROR_GUIDES: Guide[] = [
  OUT_OF_MEMORY,
  JAVA_VERSION,
  CANT_KEEP_UP,
  FAILED_TO_BIND,
];

