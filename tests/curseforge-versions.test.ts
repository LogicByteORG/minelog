import assert from "node:assert/strict";
import { test } from "node:test";
import { parseInvalidVersionId, pickVersionIds } from "../apps/plugins/scripts/cf-versions.mjs";

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

test("a lone entry with an uncommon type is dropped instead of failing the upload", () => {
  const entries = [
    { id: 1, name: "1.20", gameVersionTypeID: 100 },
    { id: 2, name: "1.20.1", gameVersionTypeID: 100 },
    { id: 7430, name: "1.8", gameVersionTypeID: 999 },
  ];
  const found = pickVersionIds(["1.20", "1.20.1", "1.8"], entries);
  assert.deepEqual(found.ids, [1, 2]);
  assert.deepEqual(found.dropped, ["1.8=7430"]);
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
