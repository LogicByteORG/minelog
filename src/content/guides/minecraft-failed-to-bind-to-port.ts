import type { Guide } from "./types";

export const FAILED_TO_BIND: Guide = {
  slug: "minecraft-failed-to-bind-to-port",
  path: "/guides/minecraft-failed-to-bind-to-port",
  title: "How to fix \"Failed to bind to port\" on a Minecraft server",
  metaTitle: "Fix Minecraft \"Failed to bind to port\" error",
  description:
    "The server can't use its port, normally because another program has it or server-ip is wrong. The fix is short.",
  lead: "The server asked for a port and didn't get it. The cause is almost always sitting on the same machine, so leave the router alone for now.",
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
          text: "By default a server listens on port 25565, unless `server-port` in `server.properties` says something else, and only one program can own a port at a time. When something already has it, Java throws `java.net.BindException: Address already in use` and the server prints the banner above. Windows adds a little extra on the last line, ending it with `Address already in use: bind`.",
        },
      ],
    },
    {
      id: "already-running",
      heading: "A server that's still running",
      blocks: [
        {
          type: "p",
          text: "Usually it's an earlier session that never fully closed, which you can spot as a second `java.exe` or `javaw.exe` hanging around in the taskbar. To see who has the port on Windows, run `netstat -ano | findstr :25565` and look at the last column of the `LISTENING` line, which is the PID (`8412`, say), then match that number in Task Manager > Details and end the process. On Linux and macOS, `lsof -i :25565` names the owner (`ss -ltnp | grep 25565` works too on Linux), and `kill <pid>` stops it. If nothing shows up, reboot, because a program that crashed can leave the port stuck for a while.",
        },
      ],
    },
    {
      id: "server-ip",
      heading: "A filled-in server-ip",
      blocks: [
        {
          type: "p",
          text: "Open `server.properties` next and look at the `server-ip` line, which for most setups should be empty:",
        },
        {
          type: "code",
          text: `server-ip=`,
        },
        {
          type: "p",
          text: "If it holds an address that isn't this computer's own, such as your public one like `203.0.113.7`, the server can never bind to it. Clear it and the server listens on every address the machine has.",
        },
      ],
    },
    {
      id: "other-port",
      heading: "Picking another port",
      blocks: [
        {
          type: "p",
          text: "Occasionally a different program really does need 25565, and then the easy way out is changing `server-port` to something else, like 25566, and restarting. Players have to add the port to the address after that, as in `example.com:25566`. On a hosting panel the port is assigned to you, so leave it alone and ask support if it still fails.",
        },
      ],
    },
    {
      id: "not-the-router",
      heading: "It's not your router",
      blocks: [
        {
          type: "p",
          text: "Port forwarding and firewalls get blamed a lot for this one, but they aren't the cause. The Windows Defender prompt that shows up the first time `java.exe` listens, and any 25565 rule on your router, only decide who can connect from outside. This error happens at startup, long before anybody has tried. So get the server running first, and if friends still can't join after that, forward 25565 (TCP) to the server's local address, which is a separate job.",
        },
      ],
    },
    {
      id: "share-it",
      heading: "Sending the log",
      blocks: [
        {
          type: "p",
          text: "When you ask for help, send `latest.log` along with `server.properties`. Both can go onto [minelog](/), which hides IP addresses before upload.",
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
        "No, since the problem is on the machine running the server. Forwarding only decides whether people outside your network can get in.",
    },
    {
      question: "Why does it say Address already in use when nothing else is running?",
      answer:
        "Most likely a crashed server or a stray Java process is still holding it. Look with netstat or lsof, or just restart the computer.",
    },
  ],
};
