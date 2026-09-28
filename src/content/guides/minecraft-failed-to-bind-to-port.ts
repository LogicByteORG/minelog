import type { Guide } from "./types";

export const FAILED_TO_BIND: Guide = {
  slug: "minecraft-failed-to-bind-to-port",
  path: "/guides/minecraft-failed-to-bind-to-port",
  title: "How to fix \"Failed to bind to port\" on a Minecraft server",
  metaTitle: "Fix Minecraft \"Failed to bind to port\" error",
  description:
    "A Minecraft server that says FAILED TO BIND TO PORT can't use its port. The usual causes are another program on the port or a wrong server-ip. Here is the fix.",
  lead: "The server tried to use a port and couldn't. The cause is almost always on the same computer, not your router or your internet.",
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
          text: "A server listens on a port, 25565 unless you changed it. Only one program can listen on a port at a time. The error means the server asked for it and the computer said no. The exact wording after `BindException` changes with the system, and Windows adds `: bind` at the end.",
        },
      ],
    },
    {
      id: "already-running",
      heading: "Another server is already running",
      blocks: [
        {
          type: "p",
          text: "The usual cause is a server you started earlier that never closed, or a second copy of the same one. Find what's using the port and stop it:",
        },
        {
          type: "list",
          items: [
            "Windows: run `netstat -ano | findstr :25565` in a terminal. The last number is the process ID. Find it in Task Manager under Details and end that Java process.",
            "Linux and macOS: run `lsof -i :25565`, or `ss -ltnp | grep 25565` on Linux, then stop the process it lists.",
          ],
        },
        {
          type: "p",
          text: "If nothing is listed and you don't see a Java process, restart the computer once. It clears a port that a crashed program left open.",
        },
      ],
    },
    {
      id: "server-ip",
      heading: "server-ip is filled in",
      blocks: [
        {
          type: "p",
          text: "Open `server.properties` and look at the `server-ip` line. It should be empty:",
        },
        {
          type: "code",
          text: `server-ip=`,
        },
        {
          type: "p",
          text: "If it holds an address that doesn't belong to this computer, for example your public address, the server can't bind to it. Empty means it listens on all of them.",
        },
      ],
    },
    {
      id: "other-port",
      heading: "Use a different port",
      blocks: [
        {
          type: "p",
          text: "If something else needs 25565, change `server-port` in `server.properties` to another number, like 25566, and restart. Players then join with the port added to the address, like `example.com:25566`. On a hosting panel the port is assigned to you, so leave it and contact support if it fails.",
        },
      ],
    },
    {
      id: "not-the-router",
      heading: "It isn't your router",
      blocks: [
        {
          type: "p",
          text: "Port forwarding and firewalls decide whether other people can reach your server. They don't cause this error, which happens before anyone connects. Fix the local cause first, then look at forwarding if friends still can't join.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Send the log",
      blocks: [
        {
          type: "p",
          text: "If it still fails, send `latest.log` and your `server.properties`. Drop them onto [minelog](/) for a link. IP addresses are hidden before upload.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "What port does a Minecraft server use?",
      answer:
        "25565 by default. You can change it with server-port in server.properties.",
    },
    {
      question: "Do I need to forward a port to fix this error?",
      answer:
        "No. This error is about the computer the server runs on. Forwarding only decides whether people outside your network can join.",
    },
    {
      question: "Why does it say Address already in use when nothing else is running?",
      answer:
        "A crashed server or another Java process may still hold the port. Check with netstat or lsof, or restart the computer.",
    },
  ],
};
