import type { Guide } from "./types";

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
