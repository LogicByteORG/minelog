import { ERROR_GUIDES } from "./guides-errors";
import {
  MAX_LOG_BYTES,
  MAX_LOG_LINES,
  RETENTION_DAYS,
} from "@/lib/config";

export type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "code"; text: string; caption?: string }
  | { type: "table"; head: string[]; rows: string[][] };

export type Section = { id: string; heading: string; blocks: Block[] };

export type Faq = { question: string; answer: string };

export type Guide = {
  slug: string;
  path: string;
  title: string;
  metaTitle: string;
  description: string;
  lead: string;
  updated: string;
  sections: Section[];
  faq: Faq[];
  related: string[];
};

const MB = MAX_LOG_BYTES / (1024 * 1024);
const lines = MAX_LOG_LINES.toLocaleString("en");

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

export const CRASH_REPORT: Guide = {
  slug: "minecraft-crash-report",
  path: "/guides/minecraft-crash-report",
  title: "How to read a Minecraft crash report",
  metaTitle: "How to read a Minecraft crash report",
  description:
    "A crash report looks like a wall of text, but the answer is usually in three places. Learn what Description, the stack trace and Caused by lines mean.",
  lead: "A crash report looks like a wall of text, but you only need a few lines of it, and they're near the top.",
  updated: "2026-09-26",
  related: ["find-minecraft-logs", "minecraft-out-of-memory-error", "minecraft-java-version-error", "share-a-log-file-safely"],
  sections: [
    {
      id: "whats-in-it",
      heading: "What's in a crash report",
      blocks: [
        {
          type: "p",
          text: "Every report starts the same way: a header, a joke comment, the time, a description, and then the error itself. This is an invented example:",
        },
        {
          type: "code",
          caption: "An invented example, not a real mod",
          text: `---- Minecraft Crash Report ----
// Why did you do that?

Time: 2026-09-20 20:49:02
Description: Ticking entity

java.lang.NullPointerException: Cannot invoke "net.minecraft.world.entity.Entity.getId()" because "passenger" is null
	at com.example.coolmod.entity.SaddleGoal.tick(SaddleGoal.java:88)
	at net.minecraft.world.entity.ai.goal.GoalSelector.tick(GoalSelector.java:120)`,
        },
        {
          type: "p",
          text: "After that come detail sections like `-- Head --`, and `-- System Details --` at the very end. The details say where and when it happened. The top says why.",
        },
      ],
    },
    {
      id: "description",
      heading: "Start with Description",
      blocks: [
        {
          type: "p",
          text: "`Description:` says what the game was doing when it failed. Common ones are `Ticking entity`, `Ticking block entity`, `Exception in server tick loop` and `Initializing game`. It doesn't name the culprit, but it narrows the search. Ticking an entity points at a mob or an item. Initializing the game points at startup, usually a mod that didn't load.",
        },
      ],
    },
    {
      id: "exception",
      heading: "Read the exception, then the last Caused by",
      blocks: [
        {
          type: "p",
          text: "The line under Description names the exception, like `NullPointerException`, with a message. If there are lines starting with `Caused by:` below it, read the last one first. The ones above it only describe how the error travelled. The last one is usually the real cause.",
        },
      ],
    },
    {
      id: "whose-code",
      heading: "Work out whose code it is",
      blocks: [
        {
          type: "p",
          text: "The lines that start with `at` are the path the code took. The start of each name shows who owns it:",
        },
        {
          type: "list",
          items: [
            "`net.minecraft` is the game itself.",
            "`net.fabricmc`, `net.minecraftforge` and `net.neoforged` are mod loaders. `org.spongepowered.asm.mixin` is Mixin, which many mods use to change the game.",
            "Anything else usually belongs to a mod, and the middle of the name often shows which one, like `com.example.coolmod`.",
          ],
        },
        {
          type: "p",
          text: "The first line that isn't `net.minecraft` is a good suspect. Only a suspect: it's where to start looking, not a verdict.",
        },
      ],
    },
    {
      id: "system-details",
      heading: "Keep System Details",
      blocks: [
        {
          type: "p",
          text: "Scroll down to `-- System Details --`. It lists the Minecraft version, the Java version, how much memory the game had and, if you use mods, every mod. Whoever is helping will ask for it, so leave it in.",
        },
      ],
    },
    {
      id: "common-causes",
      heading: "Common causes",
      blocks: [
        {
          type: "list",
          items: [
            "A mod made for a different Minecraft version than the one you run.",
            "A mod that's missing a library or another mod it depends on.",
            "Two mods that change the same thing and clash.",
            "`java.lang.OutOfMemoryError`: the game ran out of memory.",
            "`UnsupportedClassVersionError`: something needs a newer Java than the one you're using.",
          ],
        },
      ],
    },
    {
      id: "get-help",
      heading: "Getting help",
      blocks: [
        {
          type: "p",
          text: "Send the whole report, all the way to the bottom. Helpers look for details that aren't at the top. Put it on [minelog](/) and share the link, and say what you did right before the crash and whether it started after you added or updated something. If you can't find the file, the [guide to finding your logs](/guides/find-minecraft-logs#crash-reports) shows where crash reports are.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "What does Caused by mean in a crash report?",
      answer:
        "It shows the chain of errors that led to the crash. Each Caused by line goes one step deeper, and the last one is usually the real cause.",
    },
    {
      question: "Do I need to share the whole crash report?",
      answer:
        "Yes. The top shows what failed, but people helping you also need the details further down, like the Java version and the mod list.",
    },
    {
      question: "Can I delete old crash reports?",
      answer:
        "Yes. The game only reads them when you open them yourself. Old ones just take up a little space, and new crashes create new files.",
    },
  ],
};

export const SHARE_SAFELY: Guide = {
  slug: "share-a-log-file-safely",
  path: "/guides/share-a-log-file-safely",
  title: "How to share a log file without leaking private details",
  metaTitle: "How to share a log file safely",
  description:
    "Log files can hold your IP address, your Windows username and even login tokens. This is what to look for and how to share a log without exposing it.",
  lead: "Logs are made for debugging, and they pick up details about you on the way. Before you paste one into a chat or a forum, check for these.",
  updated: "2026-09-24",
  related: ["find-minecraft-logs", "minecraft-crash-report"],
  sections: [
    {
      id: "what-hides",
      heading: "What hides in a log",
      blocks: [
        {
          type: "list",
          items: [
            "IP addresses. A server log usually records the address of every player who joins, and a client log records the server you connect to.",
            "Your user folder name. File paths like `C:\\Users\\Marta\\AppData\\Roaming\\.minecraft` contain your Windows account name, which is often your real name.",
            "Access tokens. Some launchers print their launch arguments, and one of them, `--accessToken`, is the key to your account session.",
            "Email addresses, from some plugins and mods.",
          ],
        },
        {
          type: "p",
          text: "Player names are in there too. They're public on a server, so they're usually fine to share, and whoever is debugging needs them.",
        },
      ],
    },
    {
      id: "screenshots",
      heading: "Why a screenshot is worse",
      blocks: [
        {
          type: "p",
          text: "A screenshot cuts off the lines around the error, can't be searched and can't be copied. It can also show private details that happened to be on screen. Send the text.",
        },
      ],
    },
    {
      id: "where-to-post",
      heading: "Where to post it",
      blocks: [
        {
          type: "p",
          text: "Pasting thousands of lines into a chat buries the conversation, and a public paste can be read by anyone. A link that expires and isn't listed anywhere is a better default. That's what a log sharing site is for.",
        },
      ],
    },
    {
      id: "by-hand",
      heading: "Hiding the details yourself",
      blocks: [
        {
          type: "steps",
          items: [
            "Open the log in a text editor that has find and replace.",
            "Search for `C:\\Users\\` (or `/Users/` and `/home/` on macOS and Linux) and replace your folder name with something neutral.",
            "Search for `accessToken` and blank out the value after it.",
            "Search for your own IP address and any other addresses on your network.",
            "Read the top and the bottom of the file once more before you post it.",
          ],
        },
      ],
    },
    {
      id: "let-the-tool",
      heading: "Or let the site do it",
      blocks: [
        {
          type: "p",
          text: "[minelog](/) replaces IPv4 addresses, MAC addresses, user folder names, tokens and email addresses in your browser before anything is uploaded, then again on the server. The preview shows exactly what will be saved. It doesn't hide player names or IPv6 addresses.",
        },
        {
          type: "p",
          text: `A link works for ${RETENTION_DAYS} days and then the log is deleted. You can delete a log yourself in the first hour, with the button at the bottom of its page. After that it stays until it expires, so read the preview before you press Get link. The [privacy page](/privacy) has the details.`,
        },
      ],
    },
  ],
  faq: [
    {
      question: "Is it safe to share my whole log?",
      answer:
        "Once private details like your IP address, user folder name and tokens are hidden, usually yes. Always read the preview before you post it.",
    },
    {
      question: "Are player names hidden?",
      answer:
        "No. Player names stay on purpose, because they're public on a server and people debugging the log need them.",
    },
    {
      question: "Can search engines find a log I share?",
      answer:
        "On minelog, no. Log pages are marked so search engines skip them, and the links are random and can't be guessed.",
    },
  ],
};

export const MINELOG_AND_MCLOGS: Guide = {
  slug: "minelog-and-mclogs",
  path: "/guides/minelog-and-mclogs",
  title: "minelog and mclo.gs",
  metaTitle: "minelog vs mclo.gs, mclogs.minestrator.com and Pastebin",
  description:
    "A bigger size limit, a longer window before logs expire, and redaction that happens in your browser first. See how minelog compares to mclo.gs, its mclogs.minestrator.com mirror, and Pastebin.",
  lead: "mclo.gs is a log sharing service built by Aternos, and the one most Minecraft launchers, mods and Discord bots already point at. minelog does the same basic job — paste a log, get a link — with a bigger size limit, a longer window before logs expire, and private details stripped in your browser before anything is even uploaded. Its API is also built so tools written for mclo.gs work with minelog by changing one address.",
  updated: "2026-09-28",
  related: ["find-minecraft-logs", "share-a-log-file-safely"],
  sections: [
    {
      id: "in-common",
      heading: "What they have in common",
      blocks: [
        {
          type: "p",
          text: "Both take a log and give you a link. Log levels are highlighted, private details like IP addresses are hidden, and there's an API for launchers, mods and server panels.",
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
            ["Largest log", `${MB} MB`, "10 MiB"],
            ["Most lines", lines, "25,000"],
            [
              "Hidden before saving",
              "IP addresses, MAC addresses, user folder names, tokens and email addresses — stripped in your browser before upload, then checked again on the server",
              "IP addresses and other sensitive details",
            ],
            [
              "Finding the problem for you",
              "Yes. It reads the game version, loader, Java, launcher and mods, then flags specific problems — out of memory, a port already in use, a plugin needing a newer server and more — each with something to try",
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
          text: "The mclo.gs column comes from its public API (api.mclo.gs/1/limits, checked September 2026) and can change. minelog isn't affiliated with mclo.gs or Aternos.",
        },
      ],
    },
    {
      id: "using-tools",
      heading: "Using mclo.gs tools with minelog",
      blocks: [
        {
          type: "p",
          text: "If a launcher, mod or bot already uploads to mclo.gs, change `api.mclo.gs` to `api.minelog.org` and keep the `/1` paths. Uploads, reading a log, raw text, limits, deleting and log analysis all work the same way. One thing worth knowing for bots: minelog's `problems` list is shorter and pattern-based rather than exhaustive, so it can come back empty on a log mclo.gs would flag something on. In exchange, minelog's `information` reads more out of the log itself — loader, Java version, launcher and mods — so there's usually still something to show. The details are in the [API docs](/api#mclogs).",
        },
      ],
    },
    {
      id: "using-both",
      heading: "Using both",
      blocks: [
        {
          type: "p",
          text: `You don't have to pick one — a log saved on one doesn't need to be on the other, and links from either keep working. If you're choosing, minelog gives you a bigger size limit (${MB} MB against 10 MiB), a longer window before a log expires (${RETENTION_DAYS} days against mclo.gs's 90), and redaction that happens before anything leaves your browser. mclo.gs has been around longer and its problem detection reflects that. Most people just use whichever one their launcher, host or Discord bot already points at — and switching later is a one-line change either way.`,
        },
      ],
    },
    {
      id: "minestrator",
      heading: "What about mclogs.minestrator.com?",
      blocks: [
        {
          type: "p",
          text: "mclogs.minestrator.com is a separate instance of the same open-source software mclo.gs runs, hosted by MineStrator, a Minecraft hosting company, rather than by Aternos. Its own API reports the same 10 MiB size limit, the same 25,000 line limit, and the same 90-day expiry as mclo.gs — it's a mirror with different branding, not a different tool. Everything on this page about mclo.gs and its /1 API applies to it too.",
        },
      ],
    },
    {
      id: "pastebin",
      heading: "What about Pastebin?",
      blocks: [
        {
          type: "p",
          text: "Pastebin is a general text paste site, not a Minecraft tool, and it shows: there's no log level highlighting, no crash or version detection, and nothing gets redacted for you, so an IP address or access token in a log stays right there unless you cut it out yourself. A guest paste tops out at 512 KB — small enough that a real latest.log often won't fit — and paying for PRO only raises that to 10 MiB, still under minelog's limit. Pastes are public and indexed by search engines by default, and stay online indefinitely unless you set an expiry date yourself. It's a fine tool for a snippet of code; a full Minecraft log is what minelog, mclo.gs and their mirrors exist for.",
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
        "Yes. You can share one log on both, or point a tool at whichever you prefer.",
    },
    {
      question: "Is mclogs.minestrator.com the same as mclo.gs?",
      answer:
        "Same underlying software and the same limits (10 MiB, 25,000 lines, a 90-day expiry), just hosted by MineStrator instead of Aternos. Anything here about using mclo.gs with minelog applies to it too.",
    },
    {
      question: "Why not just use Pastebin for a Minecraft log?",
      answer:
        "You can, but it isn't built for it: no redaction, no log formatting, no crash detection, and a 512 KB size limit on a free account that a full log can easily exceed. minelog and mclo.gs both hide private details automatically and read the log itself for you.",
    },
    {
      question: "Can I delete a log on minelog?",
      answer: `Yes, in the first hour after you save it. Open the log in the same browser and use the button at the bottom of the page, or send the delete token to the API if you saved it from an app. After that hour the log stays until it deletes itself, ${RETENTION_DAYS} days after it was saved, so read the preview before you upload.`,
    },
    {
      question: "Does minelog analyse logs?",
      answer:
        "Yes. The Analyze menu on a saved log shows the game version, loader, Java version, launcher and mods, and flags known problems — like running out of memory, a port already in use, or a plugin needing a newer server — each with something to try. It won't explain every crash, but it covers the common ones.",
    },
  ],
};

export const GUIDES: Guide[] = [
  FIND_LOGS,
  CRASH_REPORT,
  SHARE_SAFELY,
  ...ERROR_GUIDES,
  MINELOG_AND_MCLOGS,
];

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

