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
        { type: "p", text: "The default game folder depends on your system:" },
        {
          type: "list",
          items: [
            "Windows: `%APPDATA%\\.minecraft\\logs\\latest.log`. To get there fast, press Win+R, type `%appdata%\\.minecraft` and press Enter.",
            "macOS: `~/Library/Application Support/minecraft/logs/latest.log`",
            "Linux: `~/.minecraft/logs/latest.log`",
          ],
        },
        {
          type: "p",
          text: "Launchers like Prism Launcher, Modrinth App and CurseForge often keep every instance in its own folder. Open the instance's folder from the launcher (look for a Folder or Open folder button) and go into `logs`. Many launchers can also show or copy the log for you, no folders needed.",
        },
      ],
    },
    {
      id: "server-logs",
      heading: "Server logs",
      blocks: [
        {
          type: "p",
          text: "On a server it's `logs/latest.log`, in the folder the server starts from. Hosting panels usually list it under Files, and the Console tab shows the same text as it's written.",
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
          text: "Sometimes the game just vanishes and there's no crash report. Look for a file called `hs_err_pid` plus a number, like `hs_err_pid12345.log`, in the game folder or the server folder. Java writes it when it crashes itself. Send that too.",
        },
      ],
    },
    {
      id: "older-logs",
      heading: "Older logs and debug.log",
      blocks: [
        {
          type: "p",
          text: "Every launch replaces `latest.log`. The old ones get compressed and named after the date, like `2026-09-20-1.log.gz`. Some versions also write a `debug.log` with more detail. Start with `latest.log`, and only dig out the dated ones if the problem happened in an earlier session.",
        },
        {
          type: "p",
          text: "minelog can't open `.gz` files, so unpack the file first.",
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
            "Open the file in a text editor, select everything and copy it. Or skip that and drop the file onto [minelog](/).",
            "Look at the preview. IP addresses, MAC addresses, user folder names, tokens and email addresses are replaced before anything is uploaded.",
            "Press Get link and send the link to whoever is helping you.",
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
        "In %APPDATA%\\.minecraft\\logs, unless your launcher keeps the game in its own instance folder. Press Win+R, type %appdata%\\.minecraft and press Enter to open the game folder.",
    },
    {
      question: "Which file should I send, latest.log or the crash report?",
      answer:
        "If the game crashed, send both. The crash report shows what failed, and latest.log shows what happened before it.",
    },
    {
      question: "Should I send a screenshot of the error?",
      answer:
        "No. A screenshot cuts off the lines that matter and can't be searched. Send the whole file, or a link to it.",
    },
    {
      question: "Where do I find logs on a hosting panel?",
      answer:
        "Open the Files tab and go to the logs folder for latest.log, or the crash-reports folder for crash reports. The Console tab shows the same output live.",
    },
  ],
};
