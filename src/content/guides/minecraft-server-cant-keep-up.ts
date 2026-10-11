import type { Guide } from "./types";

export const CANT_KEEP_UP: Guide = {
  slug: "minecraft-server-cant-keep-up",
  path: "/guides/minecraft-server-cant-keep-up",
  title: "What \"Can't keep up! Is the server overloaded?\" means",
  metaTitle: "Minecraft \"Can't keep up\" warning: causes and fixes",
  description:
    "The server logs Can't keep up! Is the server overloaded? when a tick takes too long. Learn what it means, when to ignore it and how to find what causes the lag.",
  lead: "The server fell behind, that's all. It's a lag message, not a crash, and a single line of it is nothing to worry about.",
  updated: "2026-09-26",
  related: ["find-minecraft-logs", "minecraft-exception-in-server-tick-loop", "share-a-log-file-safely"],
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
          text: "The numbers say how far behind it got: 2345ms is about 46 ticks of 50 ms. While it's late, everything slows down for every player at once. Blocks break late, mobs stutter, players rubber-band back.",
        },
        {
          type: "p",
          text: "You may also see `Did the system time change, or is the server overloaded?`. Same warning, worded for a clock that jumped, which happens when a laptop wakes from sleep.",
        },
      ],
    },
    {
      id: "when-to-ignore",
      heading: "When you can ignore it",
      blocks: [
        {
          type: "p",
          text: "A line or two while the server is starting, while a world loads, or while a lot of new land is being generated isn't worth chasing. The warning matters when it repeats during normal play, say every few seconds, or when players start complaining about lag.",
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
            "Generating new chunks, for example when several players fly off in different directions with elytra.",
            "Too many entities: a big mob farm, hundreds of dropped items, forty cows in one pen.",
            "Large redstone machines and long hopper chains, which tick every single tick.",
            "A slow processor. The server does most of its work on one thread (the `Server thread` in the log), so one fast core beats many slow ones.",
            "A plugin or mod that does heavy work on that same main thread.",
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
          text: "Guessing wastes time, so measure. Install spark, run `/spark profiler start`, let it record while the lag is happening, then run `/spark profiler stop`. You get a page that shows which plugin, mod or activity used the most tick time. On Paper and its forks, `/tps` prints the current ticks per second; a healthy server sits at 20.0.",
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
            "Lower `view-distance` and `simulation-distance` in `server.properties`; both default to 10, and 8 or 6 is a common first step. It's the quickest way to cut the work per tick.",
            "Pre-generate the world with Chunky (`/chunky radius 5000`, then `/chunky start`) so nobody triggers it during play.",
            "Reduce entities: smaller farms, fewer animals per pen, and clear the item piles.",
            "Remove plugins and mods you don't use, and update the ones you do.",
            "Check the memory setting. If the profiler shows the server is just busy, the answer is a host with a faster processor.",
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
        "No. The server keeps running; it's only behind. It becomes a problem when it repeats and players notice lag.",
    },
    {
      question: "How many ticks per second should a server have?",
      answer:
        "Twenty, so each tick gets 50 milliseconds. Below 20 the game slows down.",
    },
    {
      question: "Will more RAM stop the warning?",
      answer:
        "Only if the server was short of memory. Usually the limit is processor speed, or one heavy farm, plugin or mod, so profile before you buy more.",
    },
  ],
};
