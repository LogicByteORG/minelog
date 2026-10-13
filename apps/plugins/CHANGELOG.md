# Changelog

All notable changes to the minelog server plugins live here. The release
workflow reads the section matching the tag and uses it as the GitHub
Release notes and the Modrinth changelog.

## Unreleased

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
