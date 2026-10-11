import type { Guide } from "./types";

export const FAILED_TO_BIND: Guide = {
  slug: "minecraft-failed-to-bind-to-port",
  path: "/guides/minecraft-failed-to-bind-to-port",
  title: "How to fix \"Failed to bind to port\" on a Minecraft server",
  metaTitle: "Fix Minecraft \"Failed to bind to port\" error",
  description:
    "A Minecraft server that says FAILED TO BIND TO PORT can't use its port. The usual causes are another program on the port or a wrong server-ip. Here is the fix.",
  lead: "The server asked for a port and didn't get it. The cause is almost always on the same machine, so leave the router alone for now.",
  updated: "2026-09-26",
  related: ["find-minecraft-logs", "share-a-log-file-safely"],
  sections: [
    {
      id: "what-it-means",
      heading: "What the error looks like",
      blocks: [
        {
          type: "code",
          text: `**** FAILED TO BIND TO PORT!
The exception was: java.net.BindException: Address already in use
Perhaps a server is already running on that port?`,
        },
        {
          type: "p",
          text: "A server listens on port 25565 unless `server-port` in `server.properties` says otherwise, and a port can belong to only one program at a time. If something already holds it, the server gets `java.net.BindException: Address already in use` and prints the banner above. On Windows the last line ends in `Address already in use: bind`.",
        },
      ],
    },
    {
      id: "already-running",
      heading: "Another server is already running",
      blocks: [
        {
          type: "p",
          text: "Another server, still running: a second `java.exe` or `javaw.exe` in the taskbar, usually from an earlier session. Find what holds the port and stop it:",
        },
        {
          type: "list",
          items: [
            "Windows: `netstat -ano | findstr :25565` lists it, and the last column of the `LISTENING` line is the PID (say, `8412`); Task Manager > Details matches that to the process you can end.",
            "Linux and macOS: `lsof -i :25565` names the owner (on Linux `ss -ltnp | grep 25565` does too), and `kill <pid>` stops it.",
          ],
        },
        {
          type: "p",
          text: "Nothing listed? Reboot. A crashed program can leave the port wedged.",
        },
      ],
    },
    {
      id: "server-ip",
      heading: "server-ip is filled in",
      blocks: [
        {
          type: "p",
          text: "Next, open `server.properties` and find the `server-ip` line. For most setups it should be blank:",
        },
        {
          type: "code",
          text: `server-ip=`,
        },
        {
          type: "p",
          text: "A filled-in address that isn't this computer's own, say your public one such as `203.0.113.7`, is something the server can never bind to. Leave it blank and it listens on every address the machine has.",
        },
      ],
    },
    {
      id: "other-port",
      heading: "Use a different port",
      blocks: [
        {
          type: "p",
          text: "Sometimes another program legitimately needs 25565. Change `server-port` in `server.properties` to something else, like 25566, and restart. Players then add the port to the address, as in `example.com:25566`. On a hosting panel the port is handed to you, so don't touch it; ask support if it fails.",
        },
      ],
    },
    {
      id: "not-the-router",
      heading: "It isn't your router",
      blocks: [
        {
          type: "p",
          text: "Forwarding and firewalls aren't it. The Windows Defender prompt that pops up the first time `java.exe` listens, and the 25565 rule on your router, both control who can connect from outside, and this error fires at startup, before anyone has tried. Get the server running first. Friends still can't join? Then forward 25565 (TCP) to the server's local address, which is a separate job.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Send the log",
      blocks: [
        {
          type: "p",
          text: "For help, `latest.log` plus `server.properties`. Both can go onto [minelog](/), which hides IP addresses before upload.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "What port does a Minecraft server use?",
      answer:
        "25565, unless you've changed it. The setting is server-port in server.properties.",
    },
    {
      question: "Do I need to forward a port to fix this error?",
      answer:
        "No. The problem is on the machine running the server. Forwarding only decides whether people outside your network can get in.",
    },
    {
      question: "Why does it say Address already in use when nothing else is running?",
      answer:
        "A crashed server or a stray Java process may still be holding it. Look with netstat or lsof, or just restart the computer.",
    },
  ],
};
