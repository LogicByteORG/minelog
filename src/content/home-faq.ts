import { RETENTION_DAYS, UNHIDDEN_RETENTION_HOURS } from "@/lib/config";

export type HomeFaq = { group: string; question: string; answer: string };

// The order here is the order on the page. Each group is a real topic, so a
// reader can skip straight to the part they came for.
export const FAQ_GROUPS = ["Getting started", "Privacy and storage", "Beyond the website"] as const;

export const HOME_FAQ: HomeFaq[] = [
  {
    group: "Getting started",
    question: "Where do I find my Minecraft log?",
    answer:
      "Look for latest.log inside the logs folder of your game folder. A server has the same logs/latest.log, and crash reports land in crash-reports. The guides spell out the exact paths for Windows, macOS, Linux and hosting panels.",
  },
  {
    group: "Getting started",
    question: "Is minelog free, and do I need an account?",
    answer:
      "Free, and there are no accounts. Paste your log, get a link, done.",
  },
  {
    group: "Getting started",
    question: "What problems can minelog find?",
    answer:
      "Once you save, the log page lists the problems it knows, in plain words. Running out of memory, a mod that needs another mod, a port that's already taken, a plugin built for a newer server. Each comes with something to try. It also picks up your game version, loader, Java version and mods. It doesn't know every crash, and when it meets one it doesn't, the error is shown as written.",
  },
  {
    group: "Privacy and storage",
    question: "What private details are hidden?",
    answer:
      "IP addresses, MAC addresses, user folder names, access tokens, passwords and email addresses are replaced in your browser before anything is uploaded, and again on our server. Player names stay, so the log is still useful for debugging.",
  },
  {
    group: "Privacy and storage",
    question: "How long is a log kept?",
    answer: `Every log is deleted ${RETENTION_DAYS} days after you save it. If you turn off Hide private details, it's deleted after ${UNHIDDEN_RETENTION_HOURS} hours instead. You can delete it yourself in the first hour, from the button at the bottom of its page. After that it stays until it expires, so check the preview before you press Get link.`,
  },
  {
    group: "Privacy and storage",
    question: "Who can see my log?",
    answer:
      "Anyone who has the link. Links are random and can't be guessed, and log pages are kept out of search engines. Share the link only where you'd be fine with the log being read.",
  },
  {
    group: "Beyond the website",
    question: "Can I share a log straight from my server?",
    answer:
      "Yes. The minelog plugin adds /minelog share to Paper, Spigot, Purpur, Folia, BungeeCord, Waterfall and Velocity, and gives you the link in chat. Use the Download button at the top of the page to get it.",
  },
  {
    group: "Beyond the website",
    question: "Is there an API?",
    answer:
      "Yes. Launchers, mods and server panels can upload a log with one request. There's also an API that matches mclo.gs, so tools built for it work after you change the address.",
  },
];
