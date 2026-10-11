import type { Guide } from "./types";

export const FIND_LOGS: Guide = {
  slug: "find-minecraft-logs",
  path: "/guides/find-minecraft-logs",
  title: "How to find your Minecraft logs",
  metaTitle: "Where to find Minecraft logs and crash reports",
  description:
    "Find latest.log and crash reports for the Minecraft client, servers and launchers like Prism and Modrinth App. Paths for Windows, macOS and Linux.",
  lead: "Most Minecraft problems can be tracked down from one file, latest.log. This page shows where it is for the game, for servers and for launchers, and which other files are worth sending.",
  updated: "2026-09-24",
  related: ["minecraft-crash-report", "share-a-log-file-safely"],
  sections: [
    {
      id: "short-answer",
      heading: "The short answer",
      blocks: [
        {
          type: "p",
          text: "If something went wrong while you were playing or running a server, send `latest.log`. It's in a folder called `logs`, inside the game folder or the server folder. If the game crashed, send the newest file in `crash-reports` too.",
        },
      ],
    },
    {
      id: "client-logs",
      heading: "Client logs on Windows, macOS and Linux",
      blocks: [
        { type: "p", text: "Where the game folder lives depends on what you run it on:" },
        {
          type: "list",
          items: [
            "Windows: `%APPDATA%\\.minecraft\\logs\\latest.log`. The quickest way in is Win+R, then `%appdata%\\.minecraft`, then Enter.",
            "macOS: `~/Library/Application Support/minecraft/logs/latest.log`",
            "Linux: `~/.minecraft/logs/latest.log`",
          ],
        },
        {
          type: "p",
          text: "Prism Launcher, Modrinth App and CurseForge usually give each instance its own folder, so the path above won't match. Use the launcher's Folder or Open folder button on the instance, then go into `logs`. A lot of them can also show or copy the log for you, which saves the digging.",
        },
      ],
    },
    {
      id: "server-logs",
      heading: "Server logs",
      blocks: [
        {
          type: "p",
          text: "A server keeps it at `logs/latest.log`, next to the jar you start. On a hosting panel, look under Files. The Console tab prints the same text as it happens.",
        },
      ],
    },
    {
      id: "crash-reports",
      heading: "Crash reports",
      blocks: [
        {
          type: "p",
          text: "When the game crashes it writes a report to the `crash-reports` folder. The file is named after the time of the crash, like `crash-2026-09-20_20.49.02-client.txt`. Newer versions add `-client` or `-server` to the end, older ones don't. Send the newest one.",
        },
        {
          type: "p",
          text: "Not sure what's in it? [How to read a Minecraft crash report](/guides/minecraft-crash-report) goes through one.",
        },
      ],
    },
    {
      id: "java-crash",
      heading: "When Java itself crashes",
      blocks: [
        {
          type: "p",
          text: "Every so often the game disappears without leaving a crash report. Check the game or server folder for a file named `hs_err_pid` followed by a number, such as `hs_err_pid12345.log`. Java writes that one when it goes down itself, so send it along.",
        },
      ],
    },
    {
      id: "older-logs",
      heading: "Older logs and debug.log",
      blocks: [
        {
          type: "p",
          text: "Every launch replaces `latest.log`. Old ones are zipped up and renamed with the date, like `2026-09-20-1.log.gz`. Some versions also write a `debug.log` with more detail. Begin with `latest.log`. You only need the dated ones when the trouble happened in an earlier session.",
        },
        {
          type: "p",
          text: "minelog can't read `.gz` files, so unpack one before you paste it.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Share it",
      blocks: [
        {
          type: "steps",
          items: [
            "Open the file in any text editor, select all and copy. Or skip the editor and drop the file straight onto [minelog](/).",
            "Look at the preview. IP addresses, MAC addresses, user folder names, tokens and email addresses are replaced before anything is uploaded.",
            "Hit Get link and pass the address to whoever is helping.",
          ],
        },
        {
          type: "p",
          text: "Before you post a log anywhere, read [how to share a log file safely](/guides/share-a-log-file-safely).",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Where is latest.log on Windows?",
      answer:
        "Inside %APPDATA%\\.minecraft\\logs, unless your launcher gave the game its own instance folder. Win+R, then %appdata%\\.minecraft, then Enter gets you to the game folder.",
    },
    {
      question: "Which file should I send, latest.log or the crash report?",
      answer:
        "If the game crashed, send both. The crash report shows what failed, and latest.log shows what happened before it.",
    },
    {
      question: "Should I send a screenshot of the error?",
      answer:
        "Please don't. A screenshot chops off the lines people need and nobody can search it. Send the whole file, or a link to it.",
    },
    {
      question: "Where do I find logs on a hosting panel?",
      answer:
        "Open Files and look in the logs folder for latest.log, or in crash-reports for crash reports. The Console tab streams the same output live.",
    },
  ],
};
