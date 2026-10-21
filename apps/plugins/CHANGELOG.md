# Changelog

All notable changes to the minelog server plugins live here. The release
workflow reads the section matching the tag and uses it as the GitHub
Release notes and the Modrinth changelog.

## Unreleased

## 1.2.1 - 2026-10-21

A small fix for the address setting. The Bungee and Velocity jars carry the new
version number only.

- An `api-base` written without `https://`, like `api.minelog.org`, now works. Before, the
  plugin could not build a valid address from it and only said minelog could not be
  reached. Addresses that start with `http://` or `https://` are used as they are.
- `/minelog test` now writes a different error every time. Before, the second run was counted as the same
  error and your webhooks stayed quiet, so it only ever notified once.

## 1.2.0 - 2026-10-20

Servers can now connect to a minelog account, send error alerts and
notifications to webhooks, and use all of it from Skript. The Bungee and
Velocity jars carry the new version number only.

- Bukkit jar: `/minelog auth <key>` connects the server with a key from the
  dashboard (`minelog.connect`). `/minelog status` and `/minelog disconnect`
  manage the connection.
- Bukkit jar: errors in `logs/latest.log` are grouped and sent to Alerts.
  Server start and stop notices go to your webhooks. Both can be turned off in
  `config.yml` (`alerts`, `notify-start`, `notify-stop`).
- Bukkit jar: right after `/minelog auth`, the plugin warns you when Skript is missing (or could not be
  hooked), because the Skript syntax needs it. Error alerts work either way.
- Bukkit jar: `/minelog test` writes a harmless error to the server log, so you can see the whole
  path to Alerts and your webhooks work. Run it a few seconds after the server has started.
- Bukkit jar: minelog's own log lines right before a real error no longer hide that error.
- Skript syntax built into the Bukkit jar (loads only when Skript 2.9+ is installed, needs Java 17):
  `send minelog alert`, `send minelog error`, `share minelog log`,
  `delete minelog log`, the events `minelog tps drop`, `minelog error detected`,
  `minelog connected`, `minelog disconnected`, `minelog log shared` and
  `minelog send failed`, and expressions for TPS, links, errors and webhooks.

## 1.1.0 - 2026-10-15

The Bukkit jar gets a short command, a reload command and a settings
switch. The Bungee and Velocity jars carry the new version number only,
their behaviour is the same as 1.0.1.

- Bukkit jar: `/log` now works as a short form of `/minelog`, so
  `/log`, `/log <file>` and `/log delete <id>` behave the same. It is on by
  default and can be turned off with `log-command: false` in `config.yml`.
- Bukkit jar: `/minelog reload` (and `/log reload`) re-reads `config.yml`
  without a restart, including switching `/log` on or off. Needs the new
  `minelog.reload` permission, included in `minelog.admin`.
- Bukkit jar: anonymous usage numbers go to bStats (plugin 34710). Server
  owners can opt out in `plugins/bStats/config.yml`.
- Bukkit jar is now shaded so the bStats classes ship relocated inside it.

## 1.0.1 - 2026-10-14

Small hardening release. The same three jars are now also published to
Hangar (Paper, Waterfall, Velocity) alongside Modrinth.

- `/minelog delete` refuses anything that is not a log id before it talks
  to the site, so a typo can no longer turn into a strange request.
- Answer parsing tolerates spacing differences in the site reply.

## 1.0.0 - 2026-10-03

First public plugin release.

- `/minelog share [file]` uploads `logs/latest.log` or one named `.log`
  file to minelog.org, with a clickable link, problem count and raw link.
- `/minelog delete <id>` removes a recent upload with its stored token.
- One Bukkit jar covers Spigot, Paper, Purpur and Folia from 1.8.8 up.
- One Bungee jar covers BungeeCord and Waterfall. Velocity 3.x is supported.
- Uploads appear on the site as `minelog Service`.
