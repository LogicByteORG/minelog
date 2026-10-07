import { RETENTION_DAYS } from "@/lib/config";
import { MAX_LOG_MB } from "./shared";
import type { Guide } from "./types";

export const MINELOG_AND_PASTEBIN: Guide = {
  slug: "minelog-and-pastebin",
  path: "/guides/minelog-and-pastebin",
  title: "minelog and Pastebin",
  metaTitle: "minelog vs Pastebin for sharing a Minecraft log",
  description:
    "Pastebin is a general paste tool with no redaction, a 512 KB guest limit and no Minecraft parsing. See when minelog or mclo.gs fits a Minecraft log better.",
  lead: "Pastebin is a general-purpose text paste site, great for a snippet of code but not built for a full Minecraft log. minelog reads the log itself, hides private details automatically, and allows a much bigger file than a free Pastebin account does.",
  updated: "2026-09-28",
  related: ["minelog-and-mclogs", "minelog-and-mclogs-minestrator", "share-a-log-file-safely"],
  sections: [
    {
      id: "whats-different",
      heading: "It's a different kind of tool",
      blocks: [
        {
          type: "p",
          text: "minelog and mclo.gs are both built specifically to read a Minecraft log: they highlight log levels, detect the game version and loader, and hide private details on their own. Pastebin is a general text paste site with none of that. It stores whatever text you give it, with syntax highlighting for the language you pick, and nothing more.",
        },
      ],
    },
    {
      id: "differences",
      heading: "Where they differ",
      blocks: [
        {
          type: "table",
          head: ["", "minelog", "Pastebin"],
          rows: [
            ["Largest paste", `${MAX_LOG_MB} MB`, "512 KB free, 10 MB on PRO"],
            [
              "Hidden before saving",
              "IP addresses, MAC addresses, user folder names, tokens and email addresses, stripped in your browser before upload, then checked again on the server",
              "Nothing. Pastebin doesn't scan pastes, so anything private has to be removed by hand first",
            ],
            [
              "Finding the problem for you",
              "Yes. It reads the game version, loader, Java, launcher and mods, then flags specific problems, each with something to try",
              "No. It's plain text with syntax highlighting, not log parsing",
            ],
            [
              "Who can see it",
              "Only people with the link. Log pages are kept out of search engines",
              "Public and indexed by search engines by default, unless you choose unlisted, or private with an account",
            ],
            [
              "How long it lasts",
              `${RETENTION_DAYS} days, then it deletes itself`,
              "Indefinitely, unless you set an expiry date yourself",
            ],
            [
              "Account needed",
              "No, for anything",
              "No for a public or unlisted paste, yes for a private one or to delete a guest paste afterwards",
            ],
          ],
        },
        {
          type: "p",
          text: "Pastebin's numbers come from its own FAQ and developer API documentation, checked September 2026, and can change.",
        },
      ],
    },
    {
      id: "when-pastebin-fits",
      heading: "When Pastebin is still the right call",
      blocks: [
        {
          type: "p",
          text: "For a short config snippet, a one-off command, or code that has nothing to do with Minecraft, Pastebin's simplicity and huge syntax-highlighting list work fine, since it's built for exactly that. A full `latest.log` or crash report is what minelog and mclo.gs exist for instead: they're built to read the file, not just store it.",
        },
      ],
    },
    {
      id: "other-tools",
      heading: "Comparing other tools",
      blocks: [
        {
          type: "p",
          text: "See how minelog compares to [mclo.gs](/guides/minelog-and-mclogs), the log sharing tool most Minecraft launchers and bots already use, and to [mclogs.minestrator.com](/guides/minelog-and-mclogs-minestrator), a mirror of the same software under a different host.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Why not just paste a Minecraft log into Pastebin?",
      answer:
        "You can, but it isn't built for it: no redaction, no log formatting, no crash detection, and a 512 KB size limit on a free account that a full log can easily exceed. minelog and mclo.gs both hide private details automatically and read the log itself for you.",
    },
    {
      question: "Does Pastebin remove IP addresses or tokens from a log?",
      answer:
        "No. Pastebin doesn't scan or redact content. Whatever you paste goes up exactly as it is, so anything private needs to be removed by hand before you post it.",
    },
    {
      question: "Is a Pastebin paste private?",
      answer:
        "Only if you have an account and mark it private. A guest paste is public or unlisted, and public pastes are indexed by search engines.",
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
