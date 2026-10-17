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

test("the API download response is an attachment named after the log", async () => {
  const { streamedText } = await import("../src/lib/service/respond");
  const saved = streamedText("one\ntwo\n", { saveAs: logDownloadName("k7M2xq9D4") });
  assert.equal(saved.headers.get("Content-Disposition"), 'attachment; filename="minelog-k7M2xq9D4.txt"');
  assert.match(saved.headers.get("Access-Control-Expose-Headers") ?? "", /Content-Disposition/);
  assert.equal(await saved.text(), "one\ntwo\n");

  const raw = streamedText("one\n");
  assert.equal(raw.headers.get("Content-Disposition"), null);
});
