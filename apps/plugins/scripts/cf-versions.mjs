const DEFAULT_API = "https://minecraft.curseforge.com/api";

export function apiBase(value) {
  const raw = (value ?? "").trim();
  return raw ? raw.replace(/\/+$/, "") : DEFAULT_API;
}

const ADDONS_TYPE = 615;

const typeOf = (entry) =>
  typeof entry.gameVersionTypeID === "number" ? entry.gameVersionTypeID : null;

export function cloneVersions(files) {
  const list = Array.isArray(files) ? files : (files?.data ?? []);
  for (const file of list) {
    const ids = file?.gameVersions ?? file?.gameVersionIds ?? file?.versions;
    if (Array.isArray(ids) && ids.length > 0 && ids.every((id) => typeof id === "number")) {
      return ids;
    }
  }
  return null;
}

export function pickEnvironmentIds(types, entries) {
  const list = Array.isArray(types) ? types : (types?.data ?? []);
  const env = list.find(
    (type) => String(type?.name ?? "").toLowerCase() === "environment",
  );
  if (typeof env?.id !== "number") return { client: null, server: null };
  const at = (name) =>
    entries.find((entry) => entry?.name === name && entry?.gameVersionTypeID === env.id);
  return {
    client: at("Client")?.id ?? null,
    server: at("Server")?.id ?? null,
  };
}

export function parseInvalidVersionId(text) {
  const match = /Invalid game version ID:\s*(\d+)/.exec(text ?? "");
  return match ? Number(match[1]) : null;
}

export function pickVersionIds(wanted, entries) {
  const byName = new Map();
  for (const entry of entries) {
    if (typeof entry?.name !== "string" || typeof entry?.id !== "number") continue;
    const list = byName.get(entry.name) ?? [];
    list.push(entry);
    byName.set(entry.name, list);
  }
  const votes = new Map();
  for (const name of wanted) {
    const list = byName.get(name) ?? [];
    if (list.length === 1) {
      const type = typeOf(list[0]);
      if (type !== null) votes.set(type, (votes.get(type) ?? 0) + 1);
    }
  }
  const missing = [];
  const picked = [];
  for (const name of wanted) {
    const list = byName.get(name) ?? [];
    let entry = null;
    if (list.length === 1) entry = list[0];
    else if (list.length > 1) {
      entry =
        list.find((item) => typeOf(item) === ADDONS_TYPE) ??
        [...list].sort(
          (a, b) => (votes.get(typeOf(b)) ?? 0) - (votes.get(typeOf(a)) ?? 0),
        )[0];
    }
    if (!entry) missing.push(name);
    else picked.push({ name, id: entry.id, type: typeOf(entry) });
  }
  const typeCount = new Map();
  for (const item of picked) {
    if (item.type !== null) typeCount.set(item.type, (typeCount.get(item.type) ?? 0) + 1);
  }
  return {
    ids: picked.map((item) => item.id),
    names: Object.fromEntries(picked.map((item) => [item.id, item.name])),
    types: Object.fromEntries(
      picked.filter((item) => item.type !== null).map((item) => [item.id, item.type]),
    ),
    missing,
    dropped: [],
    typeCount: [...typeCount],
  };
}
