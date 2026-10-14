import assert from "node:assert/strict";
import { test } from "node:test";
import { apiBase, cloneVersions, parseInvalidVersionId, pickEnvironmentIds, pickVersionIds } from "../apps/plugins/scripts/cf-versions.mjs";

test("the api base falls back when the variable is missing or blank", () => {
  assert.equal(apiBase(undefined), "https://minecraft.curseforge.com/api");
  assert.equal(apiBase(""), "https://minecraft.curseforge.com/api");
  assert.equal(apiBase("   "), "https://minecraft.curseforge.com/api");
  assert.equal(apiBase("https://bukkit.curseforge.com/api/"), "https://bukkit.curseforge.com/api");
});

test("environment markers resolve to the Client and Server records", () => {
  const types = [
    { id: 75208, name: "Environment" },
    { id: 68441, name: "Modloader" },
  ];
  const entries = [
    { id: 90, name: "Client", gameVersionTypeID: 75208 },
    { id: 91, name: "Server", gameVersionTypeID: 75208 },
    { id: 92, name: "Fabric", gameVersionTypeID: 68441 },
  ];
  assert.deepEqual(pickEnvironmentIds(types, entries), { client: 90, server: 91 });
  assert.deepEqual(pickEnvironmentIds([{ id: 1, name: "Other" }], entries), {
    client: null,
    server: null,
  });
  assert.deepEqual(pickEnvironmentIds(types, []), { client: null, server: null });
});

test("a name with two entries picks the type the other versions vote for", () => {
  const entries = [
    { id: 1, name: "1.20", gameVersionTypeID: 100 },
    { id: 2, name: "1.20.2", gameVersionTypeID: 100 },
    { id: 3, name: "1.20.1", gameVersionTypeID: 999 },
    { id: 4, name: "1.20.1", gameVersionTypeID: 100 },
  ];
  const found = pickVersionIds(["1.20", "1.20.2", "1.20.1"], entries);
  assert.deepEqual(found.ids, [1, 2, 4]);
  assert.deepEqual(found.missing, []);
  assert.deepEqual(found.dropped, []);
});

test("a twin with the Addons type wins for Bukkit-class projects", () => {
  const entries = [
    { id: 1, name: "1.20", gameVersionTypeID: 100 },
    { id: 2, name: "1.20.2", gameVersionTypeID: 100 },
    { id: 9990, name: "1.20.1", gameVersionTypeID: 100 },
    { id: 9993, name: "1.20.1", gameVersionTypeID: 615 },
  ];
  const found = pickVersionIds(["1.20", "1.20.2", "1.20.1"], entries);
  assert.deepEqual(found.ids, [1, 2, 9993]);
  assert.deepEqual(found.dropped, []);
});

test("a twin with the unlisted type 1 wins over every listed type", () => {
  const entries = [
    { id: 9990, name: "1.20.1", gameVersionTypeID: 75125 },
    { id: 9993, name: "1.20.1", gameVersionTypeID: 615 },
    { id: 9994, name: "1.20.1", gameVersionTypeID: 1 },
  ];
  const found = pickVersionIds(["1.20.1"], entries);
  assert.deepEqual(found.ids, [9994]);
});

test("a lone entry keeps its type, the upload decides", () => {
  const entries = [
    { id: 1, name: "1.20", gameVersionTypeID: 100 },
    { id: 2, name: "1.20.1", gameVersionTypeID: 100 },
    { id: 9970, name: "1.19", gameVersionTypeID: 999 },
  ];
  const found = pickVersionIds(["1.20", "1.20.1", "1.19"], entries);
  assert.deepEqual(found.ids, [1, 2, 9970]);
  assert.deepEqual(found.dropped, []);
});

test("missing names are reported and typeless entries keep the old behavior", () => {
  const entries = [
    { id: 1, name: "1.20" },
    { id: 2, name: "1.20.1" },
  ];
  const found = pickVersionIds(["1.20", "1.20.1", "9.9.9"], entries);
  assert.deepEqual(found.ids, [1, 2]);
  assert.deepEqual(found.missing, ["9.9.9"]);
  assert.deepEqual(found.dropped, []);
});

test("the rejected version id is read from the CurseForge error", () => {
  assert.equal(
    parseInvalidVersionId('{"errorCode":1009,"errorMessage":"Invalid game version ID: 4455 belongs to an invalid dependency."}'),
    4455,
  );
  assert.equal(parseInvalidVersionId("boom"), null);
  assert.equal(parseInvalidVersionId(null), null);
});

test("kept versions carry their names for the retry log", () => {
  const entries = [
    { id: 1, name: "1.20", gameVersionTypeID: 100 },
    { id: 2, name: "1.20.1", gameVersionTypeID: 100 },
  ];
  const found = pickVersionIds(["1.20", "1.20.1"], entries);
  assert.deepEqual(found.names, { 1: "1.20", 2: "1.20.1" });
});

test("kept versions carry their types for group drops", () => {
  const entries = [
    { id: 1, name: "1.20", gameVersionTypeID: 100 },
    { id: 2, name: "1.20.1", gameVersionTypeID: 100 },
    { id: 3, name: "1.19", gameVersionTypeID: 200 },
    { id: 4, name: "1.19.1", gameVersionTypeID: 200 },
  ];
  const found = pickVersionIds(["1.20", "1.20.1", "1.19", "1.19.1"], entries);
  assert.deepEqual(found.types, { 1: 100, 2: 100, 3: 200, 4: 200 });
});

test("cloneVersions reuses the version set of an existing file", () => {
  assert.deepEqual(
    cloneVersions([{ id: 7, displayName: "v1", gameVersions: [4455, 9638] }]),
    [4455, 9638],
  );
  assert.equal(cloneVersions([{ id: 7, displayName: "v1" }]), null);
  assert.equal(cloneVersions([]), null);
  assert.equal(cloneVersions([{ id: 7, gameVersions: ["1.20"] }]), null);
});
