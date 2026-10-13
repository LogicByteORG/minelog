import assert from "node:assert/strict";
import test from "node:test";
import { logDownloadName } from "../src/lib/download";

test("download name keeps the log id with a minelog prefix", () => {
  assert.equal(logDownloadName("abc123xyz"), "minelog-abc123xyz.txt");
});

test("download name strips characters that are unsafe in file names", () => {
  assert.equal(logDownloadName("../a/b?c"), "minelog-abc.txt");
  assert.equal(logDownloadName(""), "minelog-log.txt");
});
