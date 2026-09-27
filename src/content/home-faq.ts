import { RETENTION_DAYS } from "@/lib/config";

export type HomeFaq = { question: string; answer: string };

export const HOME_FAQ: HomeFaq[] = [
  {
    question: "Where do I find my Minecraft log?",
    answer:
      "The game log is latest.log, in the logs folder inside your game folder. Servers keep theirs in logs/latest.log too, and crash reports go in a folder called crash-reports. The guides have the exact paths for Windows, macOS, Linux and hosting panels.",
  },
  {
    question: "Is minelog free, and do I need an account?",
    answer: "It's free and there are no accounts. Paste your log, get a link.",
  },
  {
    question: "What private details are hidden?",
    answer:
      "IP addresses, MAC addresses, user folder names, access tokens and email addresses are replaced in your browser before anything is uploaded, and again on our server. Player names stay, so the log is still useful for debugging.",
  },
  {
    question: "How long is a log kept?",
    answer: `Every log is deleted ${RETENTION_DAYS} days after you save it. You can delete it yourself in the first hour, from the button at the bottom of its page. After that it stays until it expires, so check the preview before you press Get link.`,
  },
  {
    question: "Who can see my log?",
    answer:
      "Anyone who has the link. Links are random and can't be guessed, and log pages are kept out of search engines.",
  },
  {
    question: "Is there an API?",
    answer:
      "Yes. Launchers, mods and server panels can upload a log with one request. There's also an API that matches mclo.gs, so tools built for it work after you change the address.",
  },
];

