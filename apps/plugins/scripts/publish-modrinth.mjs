#!/usr/bin/env node
// Publishes one minelog plugin release to Modrinth, one version per platform jar.
// Needs MODRINTH_TOKEN in the environment and optionally MODRINTH_PROJECT_ID
// (defaults to "minelog").
//
// Usage:
//   node scripts/publish-modrinth.mjs --version 1.0.0 --title "minelog plugins v1.0.0" \
//     --channel release --changelog-file CHANGELOG.1.0.0.md \
//     --file bukkit=../platform-bukkit/build/libs/minelog-bukkit-1.0.0.jar \
//     --file bungee=../platform-bungee/build/libs/minelog-bungee-1.0.0.jar \
//     --file velocity=../platform-velocity/build/libs/minelog-velocity-1.0.0.jar \
//     [--dry-run]
//
// --channel is one of: release, beta, alpha.

import { readFileSync, statSync } from "node:fs";

const API = "https://api.modrinth.com/v2";

// Loaders validated against GET /v2/tag/loader on 2026-10-03. Every entry
// below supports the "plugin" project type. Modrinth checks a jar against every
// loader of its version (a proxy jar must carry velocity-plugin.json for the
// velocity loader, and so on), so each jar becomes its own version with only
// the loaders it actually supports.
const LOADERS_BY_PART = {
  bukkit: ["bukkit", "paper", "purpur", "spigot", "folia"],
  bungee: ["bungeecord", "waterfall"],
  velocity: ["velocity"],
};
const LABEL_BY_PART = {
  bukkit: "Paper, Spigot, Purpur, Folia",
  bungee: "BungeeCord, Waterfall",
  velocity: "Velocity",
};

// Explicit game versions validated against GET /v2/tag/game_version on
// 2026-10-03. Extend the top end when new Minecraft releases come out.
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
  console.error("Usage: publish-modrinth.mjs --version X --title T --channel release|beta|alpha --changelog-file F --file part=path [--dry-run]");
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
  if (!LOADERS_BY_PART[file.part]) {
    console.error(`Unknown file part "${file.part}", expected one of: ${Object.keys(LOADERS_BY_PART).join(", ")}`);
    process.exit(1);
  }
}

const changelog = readFileSync(changelogFile, "utf8");
const buildData = (file) => ({
  name: `${title} (${LABEL_BY_PART[file.part]})`,
  version_number: version,
  changelog,
  dependencies: [],
  game_versions: GAME_VERSIONS,
  version_type: channel,
  loaders: LOADERS_BY_PART[file.part],
  featured: false,
  status: "listed",
  project_id: null,
  file_parts: [file.part],
  primary_file: file.part,
});

if (dryRun) {
  for (const file of files) {
    const data = buildData(file);
    console.log(JSON.stringify({ ...data, changelog: data.changelog.slice(0, 120) }, null, 2));
    console.log(`file: ${file.part}=${file.path}`);
  }
  process.exit(0);
}

const token = process.env.MODRINTH_TOKEN;
if (!token) {
  console.error("MODRINTH_TOKEN is not set.");
  process.exit(1);
}

// The version endpoint wants the base62 project ID, not the slug, and answers a
// slug with a misleading 401. Resolve it first (the token also lets us see drafts).
const projectRef = process.env.MODRINTH_PROJECT_ID ?? "minelog";
const headers = { Authorization: token, "User-Agent": "minelog/1.0 (https://minelog.org)" };
const projectResponse = await fetch(`${API}/project/${encodeURIComponent(projectRef)}`, { headers });
if (!projectResponse.ok) {
  console.error(`Could not resolve Modrinth project "${projectRef}": ${projectResponse.status}`);
  console.error(await projectResponse.text());
  process.exit(1);
}
const projectId = (await projectResponse.json()).id;

// Re-runs must not duplicate a platform that already went up, so skip any jar
// whose loaders already have a version with this number.
const existingResponse = await fetch(`${API}/project/${projectId}/version`, { headers });
const existing = existingResponse.ok ? await existingResponse.json() : [];

let failed = false;
for (const file of files) {
  const data = { ...buildData(file), project_id: projectId };
  const already = existing.some(
    (entry) => entry.version_number === version && entry.loaders.some((loader) => data.loaders.includes(loader)),
  );
  if (already) {
    console.log(`Skipping ${file.part}: ${version} is already on Modrinth for ${data.loaders.join(", ")}`);
    continue;
  }

  const form = new FormData();
  form.append("data", JSON.stringify(data));
  form.append(file.part, new Blob([readFileSync(file.path)]), file.path.split("/").pop());

  const response = await fetch(`${API}/version`, { method: "POST", headers, body: form });
  if (!response.ok) {
    console.error(`Modrinth upload failed for ${file.part}: ${response.status}`);
    console.error(await response.text());
    failed = true;
    continue;
  }
  const created = await response.json();
  console.log(`Published ${file.part}: ${created.id}`);
}

if (failed) process.exit(1);
