import { RETENTION_DAYS, UNHIDDEN_RETENTION_HOURS } from "@/lib/config";
import type { Guide } from "./types";

export const SHARE_SAFELY: Guide = {
  slug: "share-a-log-file-safely",
  path: "/guides/share-a-log-file-safely",
  title: "How to share a log file without leaking private details",
  metaTitle: "How to share a log file safely",
  description:
    "Log files can quietly hold your IP address, your Windows username and even login tokens, so check before you paste one anywhere.",
  lead: "Logs are made for debugging, and on the way they pick up details about you. Before you paste one into a chat or a forum, check it for the things below.",
  updated: "2026-09-24",
  related: ["find-minecraft-logs", "minecraft-crash-report"],
  sections: [
    {
      id: "what-hides",
      heading: "What tends to hide in a log",
      blocks: [
        {
          type: "p",
          text: "A server log usually records the IP address of every player who joins, and a client log records the server you connect to, so addresses are the first thing to look for. File paths are the second. Something like `C:\\Users\\Marta\\AppData\\Roaming\\.minecraft` contains your Windows account name, which is often your real name. Some launchers also print their launch arguments, and one of them, `--accessToken`, is the key to your account session, and a few plugins and mods write email addresses as well. Player names are in there too, but they're public on a server, so they're usually fine to share, and whoever is debugging needs them.",
        },
      ],
    },
    {
      id: "screenshots",
      heading: "Why a screenshot is worse",
      blocks: [
        {
          type: "p",
          text: "A screenshot cuts off the lines around the error, can't be searched and can't be copied, and it can show private details that happened to be on screen. Send the text instead.",
        },
      ],
    },
    {
      id: "where-to-post",
      heading: "Where to post it",
      blocks: [
        {
          type: "p",
          text: "Pasting thousands of lines into a chat buries the conversation, and a public paste can be read by anyone. A link that expires and isn't listed anywhere is a better default, which is exactly what a log sharing site is for.",
        },
      ],
    },
    {
      id: "by-hand",
      heading: "Hiding the details by hand",
      blocks: [
        {
          type: "p",
          text: "Open the log in a text editor that has find and replace. Search for `C:\\Users\\` (or `/Users/` and `/home/` on macOS and Linux) and swap your folder name for something neutral, then search for `accessToken` and blank out the value after it. After that, look for your own IP address and any other addresses on your network. Finally, read the top and the bottom of the file once more before you post it, because that's where people forget.",
        },
      ],
    },
    {
      id: "let-the-tool",
      heading: "Or let the site do it",
      blocks: [
        {
          type: "p",
          text: "[minelog](/) replaces IP addresses, MAC addresses, user folder names, tokens, passwords and email addresses in your browser before anything is uploaded, then does it again on the server. The preview shows exactly what will be saved. It doesn't hide player names, and it can't know what a secret of your own looks like, so read it before you share.",
        },
        {
          type: "p",
          text: `A link works for ${RETENTION_DAYS} days and then the log is deleted, or after ${UNHIDDEN_RETENTION_HOURS} hours if you turn hiding off. You can delete a log yourself in the first hour with the button at the bottom of its page, but after that it stays until it expires, so read the preview before you press Get link. The [privacy page](/privacy) has the details.`,
        },
      ],
    },
  ],
  faq: [
    {
      question: "Is it safe to share my whole log?",
      answer:
        "Once private details like your IP address, user folder name and tokens are hidden, usually yes. Just read the preview before you post it.",
    },
    {
      question: "Are player names hidden?",
      answer:
        "No, and that's on purpose. They're public on a server, and people debugging the log need them.",
    },
    {
      question: "Can search engines find a log I share?",
      answer:
        "On minelog, no. Log pages are marked so search engines skip them, and the links are random and can't be guessed.",
    },
  ],
};
