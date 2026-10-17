import { RETENTION_DAYS } from "@/lib/config";
import { MAX_LOG_MB, MAX_LOG_LINES_LABEL } from "./shared";
import type { Guide } from "./types";

export const MINELOG_AND_MCLOGS: Guide = {
  slug: "minelog-and-mclogs",
  path: "/guides/minelog-and-mclogs",
  title: "minelog and mclo.gs",
  metaTitle: "minelog vs mclo.gs: how they compare",
  description:
    "A bigger size limit, a longer expiry window and redaction in your browser first. See how minelog compares to mclo.gs and how mclo.gs tools work with it.",
  lead: "mclo.gs is a log sharing service built by Aternos, and the one most Minecraft launchers, mods and Discord bots already point at. minelog does the same basic job (paste a log, get a link) with a bigger size limit, a longer wait before logs expire, and private details stripped in your browser before anything is even uploaded. Its API is built so that tools written for mclo.gs work with minelog after you change one address.",
  updated: "2026-09-28",
  related: ["minelog-and-mclogs-minestrator", "minelog-and-pastebin", "share-a-log-file-safely"],
  sections: [
    {
      id: "in-common",
      heading: "What they have in common",
      blocks: [
        {
          type: "p",
          text: "Both take a log and hand you a link, highlight the log levels, hide private details like IP addresses, and offer an API for launchers, mods and server panels.",
        },
      ],
    },
    {
      id: "differences",
      heading: "Where they differ",
      blocks: [
        {
          type: "table",
          head: ["", "minelog", "mclo.gs"],
          rows: [
            ["Largest log", `${MAX_LOG_MB} MB`, "10 MiB"],
            ["Most lines", MAX_LOG_LINES_LABEL, "25,000"],
            [
              "Hidden before saving",
              "IP addresses, MAC addresses, user folder names, tokens and email addresses, stripped in your browser before upload, then checked again on the server",
              "IP addresses and other sensitive details",
            ],
            [
              "Finding the problem for you",
              "Yes. It reads the game version, loader, Java, launcher and mods, then flags specific problems, like running out of memory, a port already in use or a plugin that needs a newer server, each with something to try",
              "Yes, it detects common problems and version info",
            ],
            [
              "Deleting a log early",
              `In the first hour, by whoever saved it. Either way, a log expires on its own after ${RETENTION_DAYS} days`,
              "Yes, with the token from the upload. Logs also expire on their own, after 90 days",
            ],
            ["API", "Its own /v2, plus a /1 that matches mclo.gs", "/1"],
          ],
        },
        {
          type: "p",
          text: "The mclo.gs column comes from its public API (api.mclo.gs/1/limits, checked September 2026), so it can change. minelog isn't affiliated with mclo.gs or Aternos.",
        },
      ],
    },
    {
      id: "using-tools",
      heading: "Using mclo.gs tools with minelog",
      blocks: [
        {
          type: "p",
          text: "If a launcher, mod or bot already uploads to mclo.gs, swap `api.mclo.gs` for `api.minelog.org` and keep the `/1` paths. Uploads, reading a log, raw text, limits, deleting and log analysis all behave the same way. Bot authors should know one thing, which is that minelog's `problems` list is shorter and pattern-based instead of exhaustive, so it can come back empty on a log where mclo.gs would flag something. To make up for it, minelog's `information` reads more out of the log itself (loader, Java version, launcher and mods), so there's usually still something to show. The details are in the [API docs](/api#mclogs).",
        },
      ],
    },
    {
      id: "using-both",
      heading: "Using both",
      blocks: [
        {
          type: "p",
          text: `You don't have to pick one. A log saved on one doesn't need to be on the other, and links from either keep working. If you're choosing, minelog gives you a bigger size limit (${MAX_LOG_MB} MB against 10 MiB), a longer window before a log expires (${RETENTION_DAYS} days against the 90 on mclo.gs), and redaction that happens before anything leaves your browser. mclo.gs has been around longer and its problem detection shows it. Most people end up using whichever one their launcher, host or Discord bot already points at, and switching later is a one-line change either way.`,
        },
      ],
    },
    {
      id: "other-tools",
      heading: "mclo.gs isn't the only alternative",
      blocks: [
        {
          type: "p",
          text: "You can also see how minelog compares to [mclogs.minestrator.com](/guides/minelog-and-mclogs-minestrator), a separate mirror running the same software under a different host, and to [Pastebin](/guides/minelog-and-pastebin), a general text paste tool that people sometimes reach for instead.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Is minelog a copy of mclo.gs?",
      answer:
        "No, it's a separate project. Its /1 API follows the public mclo.gs documentation, so tools built for mclo.gs can switch by changing the address.",
    },
    {
      question: "Can I use minelog and mclo.gs together?",
      answer:
        "Yes, you can share one log on both or point a tool at whichever you prefer.",
    },
    {
      question: "Can I delete a log on minelog?",
      answer: `Yes, but only in the first hour after you save it. Open the log in the same browser and press the button at the bottom of the page, or send the delete token to the API if the upload came from an app. Past that hour the log stays until it removes itself, ${RETENTION_DAYS} days after saving, so check the preview before you upload.`,
    },
    {
      question: "Does minelog analyse logs?",
      answer:
        "It does. On a saved log, the Analyze menu lists the game version, loader, Java version, launcher and mods, and calls out known problems such as running out of memory, a port that's already taken or a plugin built for a newer server, each with something to try. Not every crash gets an explanation, but the common ones do.",
    },
  ],
};
