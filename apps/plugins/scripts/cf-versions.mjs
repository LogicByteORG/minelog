const typeOf = (entry) =>
  typeof entry.gameVersionTypeID === "number" ? entry.gameVersionTypeID : null;

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
      entry = [...list].sort(
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
  const dropped = picked.filter(
    (item) => item.type !== null && typeCount.get(item.type) === 1 && picked.length > 1,
  );
  const kept = picked.filter((item) => !dropped.includes(item));
  return {
    ids: kept.map((item) => item.id),
    names: Object.fromEntries(kept.map((item) => [item.id, item.name])),
    missing,
    dropped: dropped.map((item) => `${item.name}=${item.id}`),
    typeCount: [...typeCount],
  };
}
