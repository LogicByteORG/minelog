import type { Guide } from "./types";

export const FIND_LOGS: Guide = {
  slug: "find-minecraft-logs",
  path: "/guides/find-minecraft-logs",
  title: "How to find your Minecraft logs",
  metaTitle: "Where to find Minecraft logs and crash reports",
  description:
    "latest.log and crash reports sit in different places for the client, servers and launchers like Prism and Modrinth App. Paths for Windows, macOS and Linux.",
  lead: "Almost every Minecraft problem can be chased back to one humble file, latest.log. Below is where it hides for the game, for servers and for the popular launchers, along with a few other files that are worth sending.",
  updated: "2026-09-24",
  related: ["minecraft-crash-report", "share-a-log-file-safely"],
  sections: [
    {
      id: "short-answer",
      heading: "The short version",
      blocks: [
        {
          type: "p",
          text: "If something broke while you were playing or running a server, grab `latest.log`. It lives in a folder called `logs` inside your game or server folder, and if the game crashed you'll want the newest file from `crash-reports` as well.",
        },
      ],
    },
    {
      id: "client-logs",
      heading: "Where the client keeps it",
      blocks: [
        {
          type: "p",
          text: "The game folder depends on your system. Windows users can press Win+R, type `%appdata%\\.minecraft` and hit Enter, which opens the game folder with `logs` inside it. A Mac keeps it under `~/Library/Application Support/minecraft/logs`, and on Linux it's `~/.minecraft/logs`.",
        },
        {
          type: "p",
          text: "Launchers such as Prism, the Modrinth App and CurseForge usually give every instance its own folder, so none of those paths will match. They all have a Folder or Open folder button on the instance, and from there you step into `logs`. Plenty of them can also show or copy the log for you, which saves the digging.",
        },
      ],
    },
    {
      id: "server-logs",
      heading: "Where a server keeps it",
      blocks: [
        {
          type: "p",
          text: "A server writes `logs/latest.log` right next to the jar you start it with. On a hosting panel it's under Files, and the Console tab prints the very same text as it happens.",
        },
      ],
    },
    {
      id: "crash-reports",
      heading: "What a crash report looks like",
      blocks: [
        {
          type: "p",
          text: "When the game crashes it drops a report into `crash-reports`, named after the moment it happened, something like `crash-2026-09-20_20.49.02-client.txt`. Newer versions add `-client` or `-server` to the end and older ones don't, but either way the newest file is the one to send. If you can't tell what's inside it, [the crash report guide](/guides/minecraft-crash-report) goes through a real one.",
        },
      ],
    },
    {
      id: "java-crash",
      heading: "When Java itself goes down",
      blocks: [
        {
          type: "p",
          text: "Now and then the game just vanishes with no crash report at all, and that usually means Java crashed before Minecraft could write one. Look in the game or server folder for a file called `hs_err_pid` followed by a number, like `hs_err_pid12345.log`, and send that along.",
        },
      ],
    },
    {
      id: "older-logs",
      heading: "Older logs and debug.log",
      blocks: [
        {
          type: "p",
          text: "Every time you launch, `latest.log` gets replaced, and the old ones are zipped and renamed with the date, like `2026-09-20-1.log.gz`. A `debug.log` with extra detail shows up in some versions too. Start with `latest.log`, because the dated ones only matter if the trouble happened in an earlier session. One catch is that minelog can't read `.gz` files, so unpack the file before you paste it.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Getting it to someone",
      blocks: [
        {
          type: "p",
          text: "Open the file in any text editor, select everything and copy, or skip the editor and drop the file straight onto [minelog](/). Have a look at the preview before you go on. IP addresses, MAC addresses, user folder names, tokens and email addresses are replaced before anything is uploaded. Then hit Get link and pass the address to whoever is helping you, and before you post a log anywhere, read [how to share a log file safely](/guides/share-a-log-file-safely).",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Where is latest.log on Windows?",
      answer:
        "Inside %APPDATA%\\.minecraft\\logs, unless your launcher gave the game its own instance folder. If you're not sure, the Run box (Win+R) and %appdata%\\.minecraft will take you straight to the game folder.",
    },
    {
      question: "Should I send latest.log or the crash report?",
      answer:
        "If the game crashed, send both. The crash report shows what failed, and latest.log shows what happened leading up to it.",
    },
    {
      question: "Is a screenshot of the error enough?",
      answer:
        "Not really, since a screenshot chops off the lines people need and nobody can search the text in it. Send the whole file or a link to it instead.",
    },
    {
      question: "Where do I look on a hosting panel?",
      answer:
        "Open Files and look in the logs folder for latest.log, or in crash-reports for crash reports. The Console tab streams the same output live.",
    },
  ],
};
