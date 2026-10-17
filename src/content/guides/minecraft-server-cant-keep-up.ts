import type { Guide } from "./types";

export const CANT_KEEP_UP: Guide = {
  slug: "minecraft-server-cant-keep-up",
  path: "/guides/minecraft-server-cant-keep-up",
  title: "What \"Can't keep up! Is the server overloaded?\" means",
  metaTitle: "Minecraft \"Can't keep up\" warning: causes and fixes",
  description:
    "That warning shows up when a tick runs long. Read what it means, when to shrug it off and how to track down the lag.",
  lead: "The server fell behind, and that's all there is to it. It's a lag message and not a crash, and a single line of it is nothing to worry about.",
  updated: "2026-09-26",
  related: ["find-minecraft-logs", "minecraft-exception-in-server-tick-loop", "share-a-log-file-safely"],
  sections: [
    {
      id: "what-it-means",
      heading: "What the warning is telling you",
      blocks: [
        {
          type: "p",
          text: "A Minecraft server does its work in ticks, twenty every second, which gives each tick 50 milliseconds. When one takes longer than that the server is running late, and it writes a line like this to the log:",
        },
        {
          type: "code",
          text: `[Server thread/WARN]: Can't keep up! Is the server overloaded? Running 2345ms or 46 ticks behind`,
        },
        {
          type: "p",
          text: "The numbers show how far behind it got, so 2345ms works out to about 46 ticks of 50 ms. While it's late everything slows down for every player at once, so blocks break late, mobs stutter and players rubber-band back. You may also see `Did the system time change, or is the server overloaded?` That's the same warning, worded for a clock that jumped, which tends to happen when a laptop wakes from sleep.",
        },
      ],
    },
    {
      id: "when-to-ignore",
      heading: "When you can ignore it",
      blocks: [
        {
          type: "p",
          text: "A line or two while the server is starting, while a world loads, or while a lot of new land is being generated isn't worth chasing. It starts to matter when it repeats during normal play, say every few seconds, or when players begin complaining about lag.",
        },
      ],
    },
    {
      id: "causes",
      heading: "What usually causes it",
      blocks: [
        {
          type: "p",
          text: "New chunks are a classic, for example when several players fly off in different directions with elytra. Too many entities do it as well, like a big mob farm, hundreds of dropped items or forty cows in one pen, and so do large redstone machines and long hopper chains, which tick every single tick. A slow processor can be the whole story, because the server does most of its work on one thread (the `Server thread` in the log), so one fast core beats many slow ones. Then there's a plugin or mod doing heavy work on that same main thread, or long memory clean-up pauses when the server has too little memory or far too much, which [the OutOfMemoryError guide](/guides/minecraft-out-of-memory-error) covers.",
        },
      ],
    },
    {
      id: "find-it",
      heading: "How to find the cause",
      blocks: [
        {
          type: "p",
          text: "Guessing wastes time, so measure instead. Install spark, run `/spark profiler start`, let it record while the lag is happening, then run `/spark profiler stop`. You get a page showing which plugin, mod or activity used the most tick time. On Paper and its forks, `/tps` prints the current ticks per second, and a healthy server sits at 20.0.",
        },
      ],
    },
    {
      id: "fixes",
      heading: "Ways to fix it",
      blocks: [
        {
          type: "p",
          text: "The quickest win is lowering `view-distance` and `simulation-distance` in `server.properties`. Both default to 10, and 8 or 6 is a common first step, since it cuts the work per tick right away. You can also pre-generate the world with Chunky (`/chunky radius 5000`, then `/chunky start`) so nobody triggers generation during play, and cut down on entities with smaller farms, fewer animals per pen and a clear-out of the item piles. Remove plugins and mods you don't use and update the ones you do, and check the memory setting too. If the profiler shows the server is simply busy, the answer is a host with a faster processor.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Sending the log",
      blocks: [
        {
          type: "p",
          text: "If you're asking for help, send `latest.log` from a session where the warning repeats. Drop it onto [minelog](/) to get a link with IP addresses hidden, and [where to find your log](/guides/find-minecraft-logs) has the paths.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Is \"Can't keep up\" a crash?",
      answer:
        "No, the server keeps running and it's only behind. It becomes a problem when it repeats and players notice lag.",
    },
    {
      question: "How many ticks per second should a server have?",
      answer:
        "Twenty, so each tick gets 50 milliseconds. Drop below 20 and the game slows down.",
    },
    {
      question: "Will more RAM stop the warning?",
      answer:
        "Only if the server was short of memory. Usually the limit is processor speed, or one heavy farm, plugin or mod, so profile before you buy more.",
    },
  ],
};
