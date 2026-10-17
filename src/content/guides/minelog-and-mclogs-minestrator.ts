import { RETENTION_DAYS } from "@/lib/config";
import { MAX_LOG_MB, MAX_LOG_LINES_LABEL } from "./shared";
import type { Guide } from "./types";

export const MINELOG_AND_MINESTRATOR: Guide = {
  slug: "minelog-and-mclogs-minestrator",
  path: "/guides/minelog-and-mclogs-minestrator",
  title: "minelog and mclogs.minestrator.com",
  metaTitle: "minelog vs mclogs.minestrator.com: how they compare",
  description:
    "mclogs.minestrator.com runs the same open-source software as mclo.gs, hosted by MineStrator. Compare its limits to minelog and learn how to switch a tool.",
  lead: "mclogs.minestrator.com is a Minecraft log sharing site run by MineStrator, a Minecraft server hosting company. It's a separate instance of the same open-source mclogs software that mclo.gs runs, not a different tool built from scratch, so its numbers match mclo.gs almost exactly. minelog does the same basic job with a bigger size limit, a longer wait before logs expire, and redaction that happens in your browser before anything is uploaded.",
  updated: "2026-09-28",
  related: ["minelog-and-mclogs", "minelog-and-pastebin", "find-minecraft-logs"],
  sections: [
    {
      id: "what-it-is",
      heading: "What it actually is",
      blocks: [
        {
          type: "p",
          text: "There's no separate product with its own code here. It's the same open-source software behind mclo.gs, self-hosted by MineStrator, and its own public API reports the exact same size limit, line limit and storage window as mclo.gs, down to the number. The only real difference is who runs it, which is MineStrator instead of Aternos.",
        },
      ],
    },
    {
      id: "differences",
      heading: "Where they differ",
      blocks: [
        {
          type: "table",
          head: ["", "minelog", "mclogs.minestrator.com"],
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
              "Yes, it detects common problems and version info, same as mclo.gs",
            ],
            [
              "Deleting a log early",
              `In the first hour, by whoever saved it. Either way, a log expires on its own after ${RETENTION_DAYS} days`,
              "Yes, with the token from the upload. Logs also expire on their own, after 90 days",
            ],
            ["API", "Its own /v2, plus a /1 that matches mclo.gs", "/1, same shape as mclo.gs"],
          ],
        },
        {
          type: "p",
          text: "The mclogs.minestrator.com column comes from its own public API (api.mclogs.minestrator.com/1/limits, checked September 2026) and matches the mclo.gs numbers exactly, since both run the same software. minelog isn't affiliated with mclogs.minestrator.com or MineStrator.",
        },
      ],
    },
    {
      id: "using-tools",
      heading: "Using its tools with minelog",
      blocks: [
        {
          type: "p",
          text: "If something already uploads to mclogs.minestrator.com, change `api.mclogs.minestrator.com` to `api.minelog.org` and keep the `/1` paths. It's the same one-line switch as moving from mclo.gs, since both expose the same API shape. minelog's `problems` list is shorter and pattern-based instead of exhaustive, so it can come back empty on a log where the other side would flag something, but its `information` object makes up some of the gap by reading more out of the log itself (loader, Java version, launcher and mods). The details are in the [API docs](/api#mclogs).",
        },
      ],
    },
    {
      id: "why-a-mirror",
      heading: "Why a mirror at all?",
      blocks: [
        {
          type: "p",
          text: "MineStrator runs it for its own hosting customers, so it may simply be what a hosting panel, plugin or Discord bot on that platform already points at by default. The two run identical software with identical limits, so there's no functional reason to prefer one over the other, and the choice usually comes down to whichever a tool is already configured for.",
        },
      ],
    },
    {
      id: "other-tools",
      heading: "Comparing other tools",
      blocks: [
        {
          type: "p",
          text: "The full [minelog and mclo.gs](/guides/minelog-and-mclogs) comparison goes into more detail on the software these two share, and [minelog and Pastebin](/guides/minelog-and-pastebin) shows how a general text paste tool stacks up instead.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Is mclogs.minestrator.com affiliated with mclo.gs or Aternos?",
      answer:
        "No. It runs the same open-source software mclo.gs does, but MineStrator operates its instance independently of Aternos.",
    },
    {
      question: "Can I use a mclo.gs tool with mclogs.minestrator.com, or the other way round?",
      answer:
        "Not directly. They're separate services with separate storage, even though the software is the same. Both are compatible with minelog's /1 API in the same way, though, so switching either one to minelog is the same one-line change.",
    },
    {
      question: "Is minelog compatible with mclogs.minestrator.com's API?",
      answer:
        "Yes, the same way it's compatible with mclo.gs, since minelog's /1 API follows the same public spec both instances use.",
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
