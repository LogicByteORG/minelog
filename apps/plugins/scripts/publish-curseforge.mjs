#!/usr/bin/env node
// Publishes one minelog plugin release to CurseForge, one file per platform jar.
// Needs CURSEFORGE_TOKEN (repository secret) and CURSEFORGE_PROJECT_ID
// (repository variable, the numeric project id) in the environment.
// CURSEFORGE_API is optional (repository variable, defaults to the
// minecraft endpoint) for projects living under another game endpoint.
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
import { apiBase, parseInvalidVersionId, pickEnvironmentIds, pickVersionIds } from "./cf-versions.mjs";

const API = apiBase(process.env.CURSEFORGE_API);
const OTHER_API =
  API === "https://minecraft.curseforge.com/api"
    ? "https://bukkit.curseforge.com/api"
    : "https://minecraft.curseforge.com/api";

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

async function probe() {
  for (const base of [API, OTHER_API]) {
    try {
      const types = await fetch(`${base}/game/version-types`, { headers });
      if (!types.ok) {
        console.log(`probe ${base} version-types: ${types.status}`);
      } else {
        const body = await types.json();
        const rows = (Array.isArray(body) ? body : (body.data ?? [])).map(
          (type) => `${type.id}=${type.name ?? type.slug}`,
        );
        console.log(`probe ${base} version-types (${rows.length}): ${rows.join(", ")}`);
      }
    } catch {
      console.log(`probe ${base} version-types: failed`);
    }
    try {
      const versions = await fetch(`${base}/game/versions`, { headers });
      if (!versions.ok) {
        console.log(`probe ${base} versions: ${versions.status}`);
      } else {
        const body = await versions.json();
        const list = Array.isArray(body) ? body : (body.data ?? []);
        const { ids } = pickVersionIds(GAME_VERSIONS, list);
        const platforms = list
          .filter((entry) => /bukkit|paper|spigot|purpur|velocity|waterfall|server|client/i.test(entry?.name ?? ""))
          .map((entry) => `${entry.id}=${entry.name}(${entry.gameVersionTypeID})`);
        console.log(`probe ${base} versions: ${list.length} records, ${ids.length} match our range`);
        console.log(`probe ${base} platform records: ${platforms.join(", ")}`);
      }
    } catch {
      console.log(`probe ${base} versions: failed`);
    }
  }
}

async function resolveEnvironmentIds(entries) {
  try {
    const response = await fetch(`${API}/game/version-types`, { headers });
    if (!response.ok) {
      console.log(`Could not list CurseForge version types: ${response.status}, uploading without environment markers.`);
      return { client: null, server: null };
    }
    const found = pickEnvironmentIds(await response.json(), entries);
    console.log(`Environment versions: Client=${found.client ?? "missing"}, Server=${found.server ?? "missing"}`);
    return found;
  } catch {
    console.log("Could not list CurseForge version types, uploading without environment markers.");
    return { client: null, server: null };
  }
}

async function resolveGameVersionIds() {
  const response = await fetch(`${API}/game/versions`, { headers });
  if (!response.ok) {
    console.error(`Could not list CurseForge game versions: ${response.status}`);
    console.error(await response.text());
    process.exit(1);
  }
  const body = await response.json();
  const entries = Array.isArray(body) ? body : (body.data ?? []);
  const { ids, names, types, missing, dropped, typeCount } = pickVersionIds(GAME_VERSIONS, entries);
  if (missing.length > 0) {
    console.log(`CurseForge has no version ids for: ${missing.join(", ")}, leaving them out.`);
  }
  const envIds = await resolveEnvironmentIds(entries);
  for (const [label, id] of Object.entries(envIds)) {
    if (id !== null && !ids.includes(id)) {
      ids.push(id);
      names[id] = label === "client" ? "Client" : "Server";
    }
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
  return { ids, names, types };
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

await probe();
const { ids: gameVersionIds, names: versionNames, types: versionTypes } = await resolveGameVersionIds();

async function uploadFile(file, name, jarName) {
  let ids = [...gameVersionIds];
  for (let attempt = 1; attempt <= 15; attempt += 1) {
    const form = new FormData();
    form.append("metadata", JSON.stringify({
      changelog,
      changelogType: "markdown",
      displayName: name,
      gameVersions: ids,
      releaseType: channel,
    }));
    form.append("file", new Blob([readFileSync(file.path)]), jarName);

    const response = await fetch(`${API}/projects/${projectId}/upload-file`, {
      method: "POST",
      headers,
      body: form,
    });
    if (response.ok) {
      const created = await response.json();
      console.log(`Published ${file.part}: ${created.id ?? "ok"}`);
      return true;
    }
    const text = await response.text();
    const rejected = response.status === 400 ? parseInvalidVersionId(text) : null;
    if (rejected === null || !ids.includes(rejected)) {
      console.error(`CurseForge upload failed for ${file.part}: ${response.status}`);
      console.error(text);
      return false;
    }
    const rejectedType = versionTypes[rejected];
    const group =
      rejectedType !== undefined
        ? ids.filter((id) => versionTypes[id] === rejectedType)
        : [rejected];
    ids = ids.filter((id) => !group.includes(id));
    const label = (id) => `${id} (${versionNames[id] ?? "unknown"})`;
    if (group.length > 1) {
      console.log(`CurseForge rejected game version ${label(rejected)}, dropping its whole type group: ${group.map(label).join(", ")}.`);
    } else {
      console.log(`CurseForge rejected game version ${label(rejected)}, retrying without it.`);
    }
    if (ids.length === 0) {
      console.error(`CurseForge upload failed for ${file.part}: no game versions left.`);
      console.error(text);
      return false;
    }
  }
  console.error(`CurseForge upload failed for ${file.part}: too many rejected versions.`);
  return false;
}

let failed = false;
for (const file of files) {
  const name = displayName(file);
  const jarName = file.path.split("/").pop();
  if (await alreadyUploaded(name, jarName)) {
    console.log(`Skipping ${file.part}: ${version} is already on CurseForge as "${name}"`);
    continue;
  }
  if (!(await uploadFile(file, name, jarName))) failed = true;
}

if (failed) process.exit(1);
