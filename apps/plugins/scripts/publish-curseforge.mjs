#!/usr/bin/env node
// Publishes one minelog plugin release to CurseForge, one file per platform jar.
// Needs CURSEFORGE_TOKEN (repository secret) and CURSEFORGE_PROJECT_ID
// (repository variable, the numeric project id) in the environment.
//
// Usage:
//   node scripts/publish-curseforge.mjs --version 1.0.1 --title "minelog plugins v1.0.1" \
//     --channel release --changelog-file CHANGELOG.1.0.1.md \
//     --file bukkit=../platform-bukkit/build/libs/minelog-bukkit-1.0.1.jar \
//     --file bungee=../platform-bungee/build/libs/minelog-bungee-1.0.1.jar \
//     --file velocity=../platform-velocity/build/libs/minelog-velocity-1.0.1.jar \
//     [--dry-run]
//
// --channel is one of: release, beta, alpha. CurseForge uses the same words.

import { readFileSync, statSync } from "node:fs";
import { pickVersionIds } from "./cf-versions.mjs";

const API = "https://minecraft.curseforge.com/api";

const LABEL_BY_PART = {
  bukkit: "Paper, Spigot, Purpur, Folia",
  bungee: "BungeeCord, Waterfall",
  velocity: "Velocity",
};

// Same range as publish-modrinth.mjs. Names are resolved to CurseForge
// version ids at publish time through GET /api/game/versions.
const GAME_VERSIONS = [
  "1.8", "1.8.1", "1.8.2", "1.8.3", "1.8.4", "1.8.5", "1.8.6", "1.8.7", "1.8.8", "1.8.9",
  "1.9", "1.9.1", "1.9.2", "1.9.3", "1.9.4",
  "1.10", "1.10.1", "1.10.2",
  "1.11", "1.11.1", "1.11.2",
  "1.12", "1.12.1", "1.12.2",
  "1.13", "1.13.1", "1.13.2",
  "1.14", "1.14.1", "1.14.2", "1.14.3", "1.14.4",
  "1.15", "1.15.1", "1.15.2",
  "1.16", "1.16.1", "1.16.2", "1.16.3", "1.16.4", "1.16.5",
  "1.17", "1.17.1",
  "1.18", "1.18.1", "1.18.2",
  "1.19", "1.19.1", "1.19.2", "1.19.3", "1.19.4",
  "1.20", "1.20.1", "1.20.2", "1.20.3", "1.20.4", "1.20.5", "1.20.6",
  "1.21", "1.21.1", "1.21.2", "1.21.3", "1.21.4", "1.21.5", "1.21.6",
  "1.21.7", "1.21.8", "1.21.9", "1.21.10", "1.21.11",
];

function usage() {
  console.error("Usage: publish-curseforge.mjs --version X --title T --channel release|beta|alpha --changelog-file F --file part=path [--dry-run]");
  process.exit(2);
}

const args = process.argv.slice(2);
const get = (name) => {
  const flag = `--${name}`;
  const at = args.indexOf(flag);
  if (at === -1 || at + 1 >= args.length) return null;
  return args[at + 1];
};

const version = get("version");
const title = get("title");
const channel = get("channel");
const changelogFile = get("changelog-file");
const dryRun = args.includes("--dry-run");
const files = args.flatMap((arg, i) => {
  if (!arg.startsWith("--file")) return [];
  const value = arg.includes("=") ? arg.slice("--file=".length) : args[i + 1];
  if (!value || value.startsWith("--")) return [];
  const eq = value.indexOf("=");
  if (eq === -1) return [];
  return [{ part: value.slice(0, eq), path: value.slice(eq + 1) }];
});

if (!version || !title || !["release", "beta", "alpha"].includes(channel) || !changelogFile || files.length === 0) {
  usage();
}

for (const file of files) {
  try {
    const stat = statSync(file.path);
    if (!stat.isFile()) throw new Error("not a file");
  } catch {
    console.error(`Missing jar: ${file.path}`);
    process.exit(1);
  }
}

for (const file of files) {
  if (!LABEL_BY_PART[file.part]) {
    console.error(`Unknown file part "${file.part}", expected one of: ${Object.keys(LABEL_BY_PART).join(", ")}`);
    process.exit(1);
  }
}

const changelog = readFileSync(changelogFile, "utf8");
const displayName = (file) => `${title} (${LABEL_BY_PART[file.part]})`;

if (dryRun) {
  for (const file of files) {
    console.log(JSON.stringify({
      displayName: displayName(file),
      version,
      releaseType: channel,
      changelogType: "markdown",
      gameVersions: GAME_VERSIONS,
      changelog: changelog.slice(0, 120),
    }, null, 2));
    console.log(`file: ${file.part}=${file.path}`);
  }
  process.exit(0);
}

const token = process.env.CURSEFORGE_TOKEN;
if (!token) {
  console.error("CURSEFORGE_TOKEN is not set.");
  process.exit(1);
}
const projectId = process.env.CURSEFORGE_PROJECT_ID;
if (!projectId) {
  console.error("CURSEFORGE_PROJECT_ID is not set.");
  process.exit(1);
}

const headers = {
  "X-Api-Token": token,
  "User-Agent": "minelog/1.0 (https://minelog.org)",
};

async function resolveGameVersionIds() {
  const response = await fetch(`${API}/game/versions`, { headers });
  if (!response.ok) {
    console.error(`Could not list CurseForge game versions: ${response.status}`);
    console.error(await response.text());
    process.exit(1);
  }
  const body = await response.json();
  const entries = Array.isArray(body) ? body : (body.data ?? []);
  const { ids, missing, dropped, typeCount } = pickVersionIds(GAME_VERSIONS, entries);
  if (missing.length > 0) {
    console.log(`CurseForge has no version ids for: ${missing.join(", ")}, leaving them out.`);
  }
  if (typeCount.length > 0) {
    console.log(`Game version type counts: ${typeCount.map(([type, count]) => `${type}:${count}`).join(", ")}`);
  }
  if (dropped.length > 0) {
    console.log(`Dropping versions with uncommon types: ${dropped.join(", ")}`);
  }
  if (ids.length === 0) {
    console.error("No game version resolved, refusing to upload untagged files.");
    process.exit(1);
  }
  return ids;
}

async function alreadyUploaded(name, jarName) {
  try {
    const response = await fetch(`${API}/projects/${projectId}/files/`, { headers });
    if (!response.ok) return false;
    const body = await response.json();
    const entries = Array.isArray(body) ? body : (body.data ?? []);
    return entries.some((entry) =>
      entry.displayName === name || entry.fileName === jarName || entry.fileNameOnDisk === jarName,
    );
  } catch {
    return false;
  }
}

const gameVersionIds = await resolveGameVersionIds();

let failed = false;
for (const file of files) {
  const name = displayName(file);
  const jarName = file.path.split("/").pop();
  if (await alreadyUploaded(name, jarName)) {
    console.log(`Skipping ${file.part}: ${version} is already on CurseForge as "${name}"`);
    continue;
  }

  const metadata = {
    changelog,
    changelogType: "markdown",
    displayName: name,
    gameVersions: gameVersionIds,
    releaseType: channel,
  };
  const form = new FormData();
  form.append("metadata", JSON.stringify(metadata));
  form.append("file", new Blob([readFileSync(file.path)]), jarName);

  const response = await fetch(`${API}/projects/${projectId}/upload-file`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!response.ok) {
    console.error(`CurseForge upload failed for ${file.part}: ${response.status}`);
    console.error(await response.text());
    failed = true;
    continue;
  }
  const created = await response.json();
  console.log(`Published ${file.part}: ${created.id ?? "ok"}`);
}

if (failed) process.exit(1);
