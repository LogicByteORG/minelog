import { RETENTION_DAYS } from "@/lib/config";
import { MAX_LOG_MB, MAX_LOG_LINES_LABEL } from "./shared";
import type { Guide } from "./types";

export const MINELOG_AND_MINESTRATOR: Guide = {
  slug: "minelog-and-mclogs-minestrator",
  path: "/guides/minelog-and-mclogs-minestrator",
  title: "minelog and mclogs.minestrator.com",
  metaTitle: "minelog vs mclogs.minestrator.com: how they compare",
  description:
    "mclogs.minestrator.com runs the same open-source software as mclo.gs, hosted by MineStrator. See how its limits compare to minelog and how to switch a tool.",
  lead: "mclogs.minestrator.com is a Minecraft log sharing site run by MineStrator, a Minecraft server hosting company. It's a separate instance of the same open-source mclogs software mclo.gs runs, not a different tool built from scratch, so its numbers match mclo.gs almost exactly. minelog does the same basic job with a bigger size limit, a longer window before logs expire, and redaction that happens in your browser before anything is uploaded.",
  updated: "2026-09-28",
  related: ["minelog-and-mclogs", "minelog-and-pastebin", "find-minecraft-logs"],
  sections: [
    {
      id: "what-it-is",
      heading: "What mclogs.minestrator.com actually is",
      blocks: [
        {
          type: "p",
          text: "mclogs.minestrator.com isn't a separate product with its own code. It's the same open-source software behind mclo.gs, self-hosted by MineStrator. Its own public API reports the exact same size limit, line limit and storage window as mclo.gs, down to the number. The only real difference is who runs it: MineStrator instead of Aternos.",
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
          text: "The mclogs.minestrator.com column comes from its own public API (api.mclogs.minestrator.com/1/limits, checked September 2026) and matches mclo.gs's numbers exactly, since both run the same software. minelog isn't affiliated with mclogs.minestrator.com or MineStrator.",
        },
      ],
    },
    {
      id: "using-tools",
      heading: "Using mclogs.minestrator.com tools with minelog",
      blocks: [
        {
          type: "p",
          text: "If something already uploads to mclogs.minestrator.com, change `api.mclogs.minestrator.com` to `api.minelog.org` and keep the `/1` paths. It's the same one-line switch as moving from mclo.gs, since both expose the same API shape. minelog's `problems` list is shorter and pattern-based rather than exhaustive, so it can come back empty on a log the other side would flag something on; its `information` object makes up some of the gap by reading more out of the log itself (loader, Java version, launcher and mods). The details are in the [API docs](/api#mclogs).",
        },
      ],
    },
    {
      id: "why-a-mirror",
      heading: "Why use a mirror instead of mclo.gs itself?",
      blocks: [
        {
          type: "p",
          text: "MineStrator runs it for its own hosting customers, so it may just be whatever a hosting panel, plugin or Discord bot on that platform already points at by default. Since the two run identical software with identical limits, there's no functional reason to prefer one over the other, so the choice usually comes down to whichever a tool is already configured for.",
        },
      ],
    },
    {
      id: "other-tools",
      heading: "Comparing other tools",
      blocks: [
        {
          type: "p",
          text: "See the full [minelog and mclo.gs](/guides/minelog-and-mclogs) comparison for more detail on the software these two share, and [minelog and Pastebin](/guides/minelog-and-pastebin) for how a general text paste tool stacks up instead.",
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
        "Not directly. They're separate services with separate storage, even though the software is the same. Both, however, are compatible with minelog's /1 API in the same way, so switching either one to minelog is the same one-line change.",
    },
    {
      question: "Is minelog compatible with mclogs.minestrator.com's API?",
      answer:
        "Yes, the same way it's compatible with mclo.gs, since minelog's /1 API follows the same public spec both instances use.",
    },
    {
      question: "Can I delete a log on minelog?",
      answer: `Yes, in the first hour after you save it. Open the log in the same browser and use the button at the bottom of the page, or send the delete token to the API if you saved it from an app. After that hour the log stays until it deletes itself, ${RETENTION_DAYS} days after it was saved, so read the preview before you upload.`,
    },
    {
      question: "Does minelog analyse logs?",
      answer:
        "Yes. The Analyze menu on a saved log shows the game version, loader, Java version, launcher and mods, and flags known problems, like running out of memory, a port already in use or a plugin that needs a newer server, each with something to try. It won't explain every crash, but it covers the common ones.",
    },
  ],
};
