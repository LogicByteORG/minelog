export type Row = string[];

export const OUTLINE: { id: string; label: string }[] = [
  { id: "overview", label: "What it does" },
  { id: "install", label: "Install" },
  { id: "connect", label: "Connect your server" },
  { id: "webhooks", label: "Pick where alerts go" },
  { id: "errors", label: "Error alerts" },
  { id: "commands", label: "Commands" },
  { id: "skript", label: "Use it from Skript" },
  { id: "effects", label: "Effects" },
  { id: "events", label: "Events" },
  { id: "expressions", label: "Expressions" },
  { id: "recipes", label: "Recipes" },
  { id: "limits", label: "Limits" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

export const COMMANDS: Row[] = [
  ["/minelog share [file]", "Uploads logs/latest.log, or one file from logs/, and gives you a link.", "minelog.share"],
  ["/minelog delete <id>", "Deletes an upload that was made from this server.", "minelog.delete"],
  ["/minelog auth <key>", "Connects the server to your account with a key from the dashboard.", "minelog.connect"],
  ["/minelog status", "Shows whether the server is connected and whether it is watching the log.", "minelog.connect"],
  ["/minelog test", "Writes a harmless test error to the log, so you can see it arrive under Alerts.", "minelog.connect"],
  ["/minelog disconnect", "Forgets the key. The server stops sending anything.", "minelog.connect"],
  ["/minelog reload", "Reads config.yml again without a restart.", "minelog.reload"],
];

export const EFFECTS: Row[] = [
  [
    'send minelog alert "Title"',
    "Sends a message to your webhooks. Without a webhook named, it goes to every webhook that listens to this server.",
  ],
  [
    'send minelog alert "Title" with message "More text" as warning',
    "Adds a second line and a level: info, warning or error. The level picks the colour in Discord, Slack and the others.",
  ],
  [
    'send minelog alert "Title" to webhook "ops-discord"',
    'Sends to one webhook, by the handle you gave it in the dashboard. Name several with to webhooks "a" and "b".',
  ],
  [
    'send minelog tps alert "Title"',
    "The same, with the type tps, crash, start or stop in front of alert. The type is sent along as the event name, and it sets a default level: warning for tps, error for crash, info for the rest.",
  ],
  [
    'send minelog error "Something broke"',
    "Saves an error under Alerts, the same place errors from the server log go. The same text is counted instead of saved twice.",
  ],
  [
    "share minelog log",
    'Uploads logs/latest.log in the background. Add named "2026-10-01-1.log" to pick another file from logs/. The link arrives in the minelog log shared event.',
  ],
  [
    'delete minelog log "id"',
    "Deletes a log this server shared earlier. You can give the id or the whole link. Logs shared from other servers cannot be deleted from here.",
  ],
];

export const EVENTS: Row[] = [
  [
    "on minelog tps drop [below 15]",
    "Runs once when the TPS falls under the number, 15 if you give none. It runs again only after the TPS climbed back up and dropped once more. The TPS is measured every 5 seconds.",
  ],
  [
    "on minelog error detected",
    "Runs when an error shows up in the server log. Use it to add your own context, or to send the error somewhere else.",
  ],
  ["on minelog connected", "Runs when the server connects to minelog, at startup or after /minelog auth."],
  ["on minelog disconnected", "Runs when the key is removed or minelog says it was revoked."],
  ["on minelog log shared", "Runs when a log was uploaded, from a command or from a script. The link is available inside."],
  [
    "on minelog send failed",
    "Runs when something could not be sent or uploaded. It fires at most once every 30 seconds, so a handler that sends an alert cannot loop.",
  ],
];

export const EXPRESSIONS: Row[] = [
  ["minelog tps", "The server's TPS over the last 5 seconds, from 0 to 20."],
  ["minelog error summary", "The error line, inside minelog error detected."],
  ["minelog error text", "The error with the log lines around it, inside minelog error detected."],
  [
    "minelog link, minelog log id, minelog raw link",
    "The page link, the id and the plain text link of a shared log. Inside minelog log shared it is that log. Anywhere else it is the last log this server shared.",
  ],
  ["minelog problem count", "How many problems minelog found in the shared log."],
  ["minelog failure reason", "Why something failed, inside minelog send failed."],
  ["minelog webhooks", "The handles of your webhooks. Empty until the server is connected."],
];

export const JOIN_SAMPLE = `on join:
    wait 2 seconds
    if player is online:
        set {_where} to location of player
        send minelog alert "%player% joined" with message "Ping: %ping of player% ms | World: %world of player% | Position: %rounded x-coordinate of {_where}%, %rounded y-coordinate of {_where}%, %rounded z-coordinate of {_where}%" as info`;

export const KICK_SAMPLE = `on kick:
    set {minelog::kicked::%uuid of player%} to true
    set {_reason} to "%the on-screen kick message%"
    if {_reason} contains "multiplayer.disconnect.kicked":
        set {_reason} to "Kicked by an operator"
    else if {_reason} contains "<lang:":
        replace all "<lang:" and ">" in {_reason} with ""
    send minelog alert "%player% was kicked" with message "Reason: %{_reason}%" as warning

on quit:
    if {minelog::kicked::%uuid of player%} is set:
        delete {minelog::kicked::%uuid of player%}
        stop
    send minelog alert "%player% left" with message "Players online: %(number of all players) - 1%" as info`;

export const TPS_SAMPLE = `on minelog tps drop below 15:
    send minelog tps alert "TPS dropped to %minelog tps%" with message "Players online: %number of all players%"`;

export const ERROR_SAMPLE = `on minelog error detected:
    send minelog alert "Error in the log" with message minelog error summary as error to webhook "ops-discord"`;

export const SHARE_SAMPLE = `command /sharelog:
    permission: op
    trigger:
        share minelog log
        send "Uploading the log..." to player

on minelog log shared:
    send "Log ready: %minelog link%" to console

on minelog send failed:
    send "minelog problem: %minelog failure reason%" to console`;

export const LIMITS: Row[] = [
  ["Servers", "10 per account"],
  ["Webhooks", "25 per account, up to 10 named in one alert"],
  ["Alerts kept", "The latest 100, each for 14 days"],
  ["Alert title", "120 characters"],
  ["Alert message", "1500 characters"],
  ["Same error", "Sent once, then not again for 20 seconds. At most 12 errors a minute from one server."],
];

export const TROUBLE: { problem: string; fix: string }[] = [
  {
    problem: "The plugin says it cannot connect.",
    fix: "Open plugins/minelog/config.yml. api-base should be https://api.minelog.org unless you host your own copy. An error about SSL means the address starts with https:// but the server only speaks plain http://.",
  },
  {
    problem: "Nothing shows up under Alerts.",
    fix: "Run /minelog status. Check that alerts is true in config.yml, then run /minelog test and wait a few seconds. Only lines at ERROR or FATAL level are sent. Skript load errors are printed as plain INFO lines, so they are not alerts.",
  },
  {
    problem: "/minelog test finds nothing right after startup.",
    fix: "Give the server a few seconds first. The plugin starts reading the log from its end, and a line written before that first look is skipped.",
  },
  {
    problem: "Skript says it can't understand a minelog line.",
    fix: "Look for “Skript found. The minelog syntax is ready.” in the console at startup. It needs Skript 2.9 or newer on Java 17 or newer. If the line is missing, Skript was not loaded before minelog or is not installed.",
  },
  {
    problem: "A webhook stays quiet.",
    fix: "Open Webhooks in the dashboard. Each row shows its last result, and the send button posts a test message. A webhook that fails ten times in a row switches itself off.",
  },
  {
    problem: "You typed a key into the game chat.",
    fix: "Commands typed in chat end up in the server log. Revoke that key under Servers and make a new one, then run /minelog auth from the console.",
  },
];
