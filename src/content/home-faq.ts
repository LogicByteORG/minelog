import { RETENTION_DAYS, UNHIDDEN_RETENTION_HOURS } from "@/lib/config";

export type HomeFaq = { group: string; question: string; answer: string };

export const FAQ_GROUPS = ["Getting started", "Privacy and storage", "Beyond the website"] as const;

export const HOME_FAQ: HomeFaq[] = [
  {
    group: "Getting started",
    question: "Where do I find my Minecraft log?",
    answer:
      "Open your game folder, then logs inside it. latest.log is in there. Servers keep the same logs/latest.log, crash reports land in crash-reports. The guides spell out the clicks for Windows, macOS, Linux and hosting panels.",
  },
  {
    group: "Getting started",
    question: "Is minelog free, and do I need an account?",
    answer:
      "Yep, free. You do not need an account to paste a log and get a link. An account is only for the server side, where your alerts and webhooks live.",
  },
  {
    group: "Getting started",
    question: "What problems can minelog find?",
    answer:
      "Once you save, the log page calls out the ones it knows in plain words. Running out of memory, a mod missing its dependency, a port that is already taken, a plugin built for a newer server, that sort of thing. Each comes with something to try. It also pulls out your game version, loader, Java version and mods. It does not know every crash though. When it meets one it has never seen, you just get the error as written.",
  },
  {
    group: "Privacy and storage",
    question: "What private details are hidden?",
    answer:
      "Your IP, MAC address, user folder names, tokens, passwords, emails. All swapped out in your browser before anything uploads, then checked again on our server. Player names stay in. The log is pretty useless for debugging without them.",
  },
  {
    group: "Privacy and storage",
    question: "How long is a log kept?",
    answer: `Every log is gone ${RETENTION_DAYS} days after you save it. Turn off Hide private details and it only sticks around for ${UNHIDDEN_RETENTION_HOURS} hours instead. You can delete it yourself in the first hour, there is a button at the bottom of its page. After that it sits until it expires, so check the preview before you press Get link.`,
  },
  {
    group: "Privacy and storage",
    question: "Who can see my log?",
    answer:
      "Anyone with the link can read it. Links are random, you cannot guess them, and log pages stay out of search engines. Still, only share yours somewhere you are fine with it being read.",
  },
  {
    group: "Beyond the website",
    question: "Can I share a log straight from my server?",
    answer:
      "Yes. The minelog plugin adds /minelog share to Paper, Spigot, Purpur, Folia, BungeeCord, Waterfall and Velocity. Run it and the link lands right in chat. Grab the plugin from the Download button up top.",
  },
  {
    group: "Beyond the website",
    question: "What are server alerts?",
    answer:
      "Connect a server to your account with a key from the dashboard. The plugin then watches the server log and saves every error under Alerts. It can also message a Discord, Slack, Microsoft Teams, Google Chat, Telegram, Guilded or Mattermost webhook.",
  },
  {
    group: "Beyond the website",
    question: "Do I need Skript for that?",
    answer:
      "No. Error alerts and start and stop notices work on their own. Skript is optional. If you have it, the plugin adds a few lines of syntax so your own scripts can send alerts and react to TPS drops and errors.",
  },
  {
    group: "Beyond the website",
    question: "Is there an API?",
    answer:
      "Yes. A launcher, mod or panel can push a log up with one request. There is also an endpoint that matches mclo.gs. Tools built for it keep working, just swap the address.",
  },
];
